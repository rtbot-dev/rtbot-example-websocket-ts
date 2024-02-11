import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { InputType } from 'src/common/database-constants';
import { WebSocket } from 'ws';

@Injectable()
export class WebSocketService {
    // we encode the websocket stream of messages in this
    // observable that we can subscribe to later at any part
    // of our program
    socketMap: { [projectId: string]: Array<WebSocket>; } = {};
    subjectMap: { [projectId: string]: Subject<any>; } = {};

    constructor() {}

    addInput(projectId: string, inputMapping: any, sources: {[sourceId: string] : any}) {

        this.subjectMap[projectId] = new Subject<any>();
        this.socketMap[projectId] = new Array<WebSocket>();
        
        const sourceIds = inputMapping.Inputs.map(im => im.InputSourceId);

        sourceIds.forEach((sourceId) => {
            if (sourceId in sources == false) {
                console.error('No source defined ' + sourceId);
            }

            const source =  sources[sourceId];

            if (source.Type != InputType.websoket) {
                console.error('No websocket type defined for input ' + sourceId);
            }

            const mappings = inputMapping.Inputs.filter(im => im.InputSourceId == sourceId);
            
            const newSocket = new WebSocket(source.Url);

            newSocket.on('error', console.error);

            newSocket.on('message', (message: Buffer) => {
                // decode the message
                const msg = JSON.parse(message.toString());

                mappings.forEach((mapping: any) => {
                    const time: number = this.getPath(msg, mapping.InputPathX ) / 
                                         (mapping.FractionX > 0 ? mapping.FractionX : 1);
                    const valueRaw = this.getPath(msg, mapping.InputPathY);
                    const value: number =  mapping.PrecisionY > 0 ? +Number.parseFloat(valueRaw).toFixed(mapping.PrecisionY)
                                                                  : +valueRaw;

                    // emit the papped message for this input.
                    this.subjectMap[projectId].next({ time,  value, inputId: mapping.InputId});
                    //this.subjectMap[projectId].next({ time, value: msg.k.c , inputId: mapping.InputId});
                });
            });

            this.socketMap[projectId].push(newSocket);           
        });
    }

    private getPath(obj: any, path: string) {
        const pathItems = path.split('.');
        var pivotObj = obj;
        pathItems.forEach((pathItem: string) => {
            pivotObj = pivotObj[pathItem];
        });        
        return pivotObj;
    }
}
