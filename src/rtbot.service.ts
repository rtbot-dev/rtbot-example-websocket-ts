import { Injectable } from '@nestjs/common';
import { WebSocketService } from './websocket.service';
import { parse } from 'yaml';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Program } from '@rtbot-dev/rtbot';

@Injectable()
export class RtBotService {
  constructor(private readonly webSocketService: WebSocketService) {
    // to keep things separetely, we choose to store our program in yaml
    // format in the `rtbot-program.yaml` file
    const programPlain = parse(
      readFileSync(join(__dirname, 'rtbot-program.yaml'), 'utf8'),
    );

    const program = Program.toInstance(programPlain);

    program.start().then(() => {
      // subscribe to the data received through the web socket
      webSocketService.ws$.subscribe(async ({ time, value }) => {
        // here is where we plug our RtBot program
        const result = await program.processMessageDebug(time, value);
        if (result.lowerBand && result.upperBand) {
          const lowerBandLimit =
            Math.round(result.lowerBand.o1[0].value * 1000) / 1000;
          const upperBandLimit =
            Math.round(result.upperBand.o1[0].value * 1000) / 1000;
          console.log(
            'time',
            time,
            'price',
            value,
            'band [',
            lowerBandLimit,
            ',',
            upperBandLimit,
            ']',
          );
          if (value > upperBandLimit) console.log('+');
          if (value < lowerBandLimit) console.log('-');
        }
      });
    });
  }
}
