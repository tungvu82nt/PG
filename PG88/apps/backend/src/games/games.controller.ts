import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GamesService } from './games.service';
import { GameQueryDto } from './dto/game-query.dto';
import { LaunchGameDto } from './dto/launch-game.dto';
import { ProviderCallbackDto } from './dto/provider-callback.dto';

@ApiTags('Games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @ApiOperation({ summary: 'List games with pagination and filters' })
  findAll(@Query() query: GameQueryDto) {
    return this.gamesService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get game details' })
  findOne(@Request() req: any) {
    // Basic implementation, usually ID comes from param
    return this.gamesService.findOne(req.params.id);
  }

  @Post('launch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Launch a game (Get Play URL)' })
  launch(@Request() req: any, @Body() launchDto: LaunchGameDto) {
    return this.gamesService.launch(req.user.userId, launchDto);
  }

  @Post('callback')
  @ApiOperation({ summary: 'Simulate Game Provider Callback (Dev Only)' })
  @ApiResponse({ status: 201, description: 'Transaction processed' })
  handleCallback(@Body() callbackDto: ProviderCallbackDto) {
    return this.gamesService.handleCallback(callbackDto);
  }
}
