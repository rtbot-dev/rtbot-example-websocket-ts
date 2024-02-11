import { Module } from '@nestjs/common';
import { WebSocketService } from './providers/websocket.service';
import { RtBotService } from './providers/rtbot.service';
import { DataBaseService } from './providers/database.service';
import { ConfigService } from './config/config.service';
import { ProjectService } from './providers/project.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ProjectService, WebSocketService, RtBotService, DataBaseService, ConfigService],
})
export class AppModule {}
