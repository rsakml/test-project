import { Controller, Get, Post, Put, Patch, Delete, Param, Body } from '@nestjs/common';
import { TodoService } from './todo.service';
import { Todo } from './todo.entity';

@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  fetchAndSaveTodos(): Promise<Todo[]> {
    return this.todoService.fetchAndSaveTodos();
  }

  @Post()
  createTodo(@Body() todoData: Partial<Todo>): Promise<Todo> {
    return this.todoService.createTodo(todoData);
  }

  @Put(':id')
  updateTodo(@Param('id') id: number, @Body() todoData: Partial<Todo>): Promise<Todo> {
    return this.todoService.updateTodo(id, todoData);
  }

  @Patch(':id')
  partialUpdateTodo(@Param('id') id: number, @Body() todoData: Partial<Todo>): Promise<Todo> {
    return this.todoService.partialUpdateTodo(id, todoData);
  }

  @Delete(':id')
  deleteTodo(@Param('id') id: number): Promise<void> {
    return this.todoService.deleteTodo(id);
  }
}
