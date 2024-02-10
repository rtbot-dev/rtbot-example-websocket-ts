import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { WebSocket } from 'ws';
import { RtBotDataBase } from './rtbot.database';

@Injectable()
export class WebSocketServices {
    
    constructor(private readonly db: RtBotDataBase) {
        this.initProcess();
    }

  // we encode the websocket stream of messages in this
  // observable that we can subscribe to later at any part
  // of our program
  ws$ = new Subject<any>();

  initProcess() {
    this.db.connect()
        .then(() => {
            this.db.GetActivePrograms();

            const ws = new WebSocket(
            // we will streaming the live market data for the pair btc/usdt
            // feel free to change this direction to stream whatever you want!
            'wss://stream.binance.com:443/ws/ethusdt@kline_1s',
            );
            ws.on('error', console.error);

            ws.on('message', (message: Buffer) => {
            // decode the message
            const msg = JSON.parse(message.toString());
            // emit only the price property
            this.ws$.next({
                time: Math.round(msg.k.T / 1000),
                value: parseFloat(msg.k.c),
            });
        })
        .catch((error) => {
            console.log(error);
        });
    });
  }
}
