import { Injectable } from '@nestjs/common';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, where, query } from 'firebase/firestore';
import { RtBotProject } from '../models/rtibot.models';
import { ConfigService } from 'src/config/config.service';
import { FIREBASE_CONFIG } from 'src/config/constants';
//import { parse } from 'yaml';

@Injectable()
export class DataBaseService {

  app: FirebaseApp;
  secrets: any;

  constructor(configService: ConfigService) {
    // - Use you own rtbot.secrets.json to store db access.
    this.secrets = configService.getConfig(FIREBASE_CONFIG);
  };

  async connect () {
    return new Promise((resolve, reject) => {
        const firebaseConfig = this.secrets['firebaseConfig'];
        // Initialize Firebase
        this.app = initializeApp(firebaseConfig);    
        const auth = getAuth(this.app);
        signInWithEmailAndPassword(auth, this.secrets['firebaseUserName'], this.secrets['firebasePassword'])
          .then((userCredential) => {
            resolve(true);
          })
          .catch((error) => {
            reject(error);
          });
    });
  }  

  async GetActiveProjects()  {
    const db = getFirestore(this.app);   
    let scriptList: Array<RtBotProject> = [];
    
    // - Get the list of running projects.
    const projectsSnapShot = await getDocs(query(collection(db, 'projects'), where('IsRunning', '==', true)));

    await Promise.all(projectsSnapShot.docs.map(async (projectSnap) => {
      // - load Project;
      const project = projectSnap.data();

      // - Load Program
      const programSnap = await getDoc(doc(db, 'programs/' + project.ProgramId));
      const program = programSnap.data();

      // - Load Mapping
      const mappingSnap = await getDoc(doc(db, 'InputMapping/' + project.InputMappingId));
      const mapping = mappingSnap.data();

      // - Load Sources
      const sourceIds = [...new Set(mapping.Inputs.map(input => input.InputSourceId))];
      const sourcesSnapShot = await getDocs(query(collection(db, 'InputSource'), where('__name__', 'in', sourceIds)));
      
      // - Register Script
      const scriptData = new RtBotProject();
      scriptData.ProjectId = projectSnap.id;
      scriptData.Project = project;
      scriptData.Program = program;
      scriptData.InputMapping = mapping;
      scriptData.Sources = Object.fromEntries(sourcesSnapShot.docs.map(sourceSnap => [sourceSnap.id, sourceSnap.data()]));

      scriptList.push(scriptData);
    }));

    return scriptList;      
  }
}