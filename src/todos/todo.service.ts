import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios'; // Import axios
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './todo.entity';
import { Cache } from '@nestjs/cache-manager'; // Import CacheService

@Injectable()
export class TodoService {
    constructor(
        @InjectRepository(Todo)
        private readonly todoRepository: Repository<Todo>,
        private readonly cacheManager: Cache, // Inject CacheService
    ) { }

    // GET: Ambil semua todo dari API dan simpan ke database
    async fetchAndSaveTodos(): Promise<Todo[]> {
        // Cek cache terlebih dahulu
        const cachedTodos = await this.cacheManager.get<Todo[]>('todos');
        if (cachedTodos) {
            return cachedTodos;
        }

        try {
            const response = await axios.get('https://jsonplaceholder.typicode.com/todos');
            const todos = response.data.map((todo) =>
                this.todoRepository.create({
                    userId: todo.userId,
                    title: todo.title,
                    completed: todo.completed,
                }),
            );

            await this.todoRepository.save(todos);

            // Cache hasilnya selama 1 jam (3600 detik)
            await this.cacheManager.set('todos', todos, 3600); // TTL langsung dalam angka
            return todos;
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch todos');
        }
    }

    // POST: Buat todo baru dan simpan ke database
    async createTodo(todoData: Partial<Todo>): Promise<Todo> {
        try {
            const response = await axios.post('https://jsonplaceholder.typicode.com/todos', todoData);
            const todo = this.todoRepository.create({
                userId: response.data.userId,
                title: response.data.title,
                completed: response.data.completed,
            });
            await this.todoRepository.save(todo);

            // Hapus cache ketika todo baru dibuat
            await this.cacheManager.del('todos');

            return todo;
        } catch (error) {
            throw new InternalServerErrorException('Failed to create todo');
        }
    }

    // PUT: Update todo berdasarkan ID
    async updateTodo(id: number, todoData: Partial<Todo>): Promise<Todo> {
        const existingTodo = await this.todoRepository.findOne({ where: { id } });
        if (!existingTodo) {
            throw new NotFoundException('Todo not found');
        }

        try {
            // Menggunakan axios untuk PUT request
            await axios.put(`https://jsonplaceholder.typicode.com/todos/${id}`, todoData);
            await this.todoRepository.save({ ...existingTodo, ...todoData });

            // Hapus cache ketika todo diperbarui sebagian
            await this.cacheManager.del('todos');

            return { ...existingTodo, ...todoData };
        } catch (error) {
            throw new InternalServerErrorException('Failed to update todo');
        }
    }

    // PATCH: Update sebagian data todo berdasarkan ID
    async partialUpdateTodo(id: number, todoData: Partial<Todo>): Promise<Todo> {
        const existingTodo = await this.todoRepository.findOne({ where: { id } });
        if (!existingTodo) {
            throw new NotFoundException('Todo not found');
        }

        try {
            // Menggunakan axios untuk PATCH request
            await axios.patch(`https://jsonplaceholder.typicode.com/todos/${id}`, todoData);
            await this.todoRepository.save({ ...existingTodo, ...todoData });

            // Hapus cache ketika todo diperbarui sebagian
            await this.cacheManager.del('todos');

            return { ...existingTodo, ...todoData };
        } catch (error) {
            throw new InternalServerErrorException('Failed to partially update todo');
        }
    }

    // DELETE: Hapus todo berdasarkan ID
    async deleteTodo(id: number): Promise<void> {
        const todo = await this.todoRepository.findOne({ where: { id } });
        if (!todo) {
            throw new NotFoundException('Todo not found');
        }

        try {
            // Menggunakan axios untuk DELETE request
            await axios.delete(`https://jsonplaceholder.typicode.com/todos/${id}`);
            await this.todoRepository.remove(todo);

            // Hapus cache ketika todo dihapus
            await this.cacheManager.del('todos');
        } catch (error) {
            throw new InternalServerErrorException('Failed to delete todo');
        }
    }
}
