import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'id', description: 'User ID', example: 'uuid-user-id' })
  @ApiResponse({
    status: 200,
    description: 'User details retrieved successfully.',
  })
  async getById(@Param('id') userId: string) {
    return this.usersService.getUserById(userId);
  }
}
