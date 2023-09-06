import { Module } from '@nestjs/common';
import { WebSocketService } from './websocket.service';
import { RtBotService } from './rtbot.service';

@Module({
  imports: [],
  controllers: [],
  providers: [WebSocketService, RtBotService],
})
export class AppModule {}
