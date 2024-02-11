import { Injectable } from '@nestjs/common';
import { DataBaseService } from './database.service';
import { WebSocketService } from './websocket.service';
import { RtBotService } from './rtbot.service';
import { RtBotProject } from 'src/models/rtibot.models';

@Injectable()
export class ProjectService {
    projects: RtBotProject[];
    websocketService: WebSocketService;
    rtBotService: RtBotService

    constructor(database: DataBaseService, wss: WebSocketService, rtbs: RtBotService) { 
        this.websocketService = wss;  
        this.rtBotService = rtbs;

        database.connect()
            .then(async () => {
                this.projects = await database.GetActiveProjects();
                this.projects.forEach((project) => {
                    this.startProject(project.ProjectId);
                });
            });
    }

    startProject(projectId: string) {
        const project = this.projects.find(p => p.ProjectId == projectId)
        if (project != null) {
            this.websocketService.addInput(projectId, project.InputMapping, project.Sources);
            this.rtBotService.addProgram(projectId, project.Program);
        }
    }
}
