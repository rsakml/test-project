import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './todo.entity';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager'; // Import CacheModule

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Todo]),
    CacheModule.register(),  // Make sure CacheModule is imported here
  ],
  providers: [TodoService],
  controllers: [TodoController],
})
export class TodoModule {}
