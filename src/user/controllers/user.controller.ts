import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
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

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'User details retrieved successfully.',
  })
  async getById(@Request() req: any) {
    return this.usersService.getUserById(req.user.userId);
  }
}
