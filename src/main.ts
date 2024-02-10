import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { RtBotDataBase } from './rtbot.database';

const db = new RtBotDataBase();

db.connect()
  .then(async ()=>{
    const scripts = await db.GetActivePrograms();
    var a = 123;
  });


//db.ReadDoc();

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(3000);
// }
// bootstrap();
