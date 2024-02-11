import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class ConfigService {  
  getConfig(location: string): any {
    return JSON.parse(readFileSync(join(__dirname, '../../config/' + location + '/rtbot.secrets.json'), 'utf8'));
  }
}