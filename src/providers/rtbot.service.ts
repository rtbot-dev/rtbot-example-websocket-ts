import { Injectable } from '@nestjs/common';
import { WebSocketService } from './websocket.service';
import { parse } from 'yaml';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Program } from '@rtbot-dev/rtbot';

@Injectable()
export class RtBotService {

    programMap: {[projectId: string]:  Program } = {};
    webSocketService: WebSocketService;

    constructor(wss: WebSocketService) {
       this.webSocketService = wss;        
    }

    addProgram (projectId: string, programObj: any) {

        this.programMap[projectId] = Program.toInstance(programObj);

        if (projectId in this.webSocketService.subjectMap == false) {
            console.error('No Subject initialized for Project ' + projectId);
            return;
        }        

        this.programMap[projectId].start().then(() => {
            // subscribe to the data received through the web socket

            this.webSocketService.subjectMap[projectId].subscribe(async ({ time, value, inputId }) => {
                // here is where we plug our RtBot program
                const result = await this.programMap[projectId].processMessageDebug(time, value, inputId);
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
