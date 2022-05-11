import './util/module-alias';
import { Server } from '@overnightjs/core'; //Through this class, Overnight server the express to application
import * as http from "http";
import { Application } from 'express';
import bodyParser from 'body-parser';
// import cors from 'cors';
import {Database} from '@src/database';
import { UserController } from './controlers/user';
import { ListsController } from './controlers/lists';
import { ItemsController } from './controlers/items';
import { AuthController } from './controlers/auth';
import apiSchema from './api.schema.json';
import swaggerUi from 'swagger-ui-express';
import * as OpenApiValidator from 'express-openapi-validator';
import {OpenAPIV3} from 'express-openapi-validator/dist/framework/types';
import cors from 'cors';

/**
 * This class is responsible for calling and config the intances of controllers, database, midwares
 * and provide the method to start the Application.
 *
 * @author Rômulo Ramos
 * @param -
 * @return -
 */
export class SetupServer extends Server {
  
  private server?:http.Server;
  private dbInstance!:Database;

  constructor(private port = 4001) {
    port = parseInt(<string>process.env.APP_PORT, 10) || 4001
    super();
  }

  /**
   * This method is responsible to configure the Server and Express with midwares
   *
   * @author Rômulo Ramos
   * @param -
   * @return -
  */
  private setupExpress(): void {
    this.app.use(bodyParser.json());
    //options for cors midddleware
    const options: cors.CorsOptions = {
      allowedHeaders: [
        'Origin',
        'Access-Control',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'X-Access-Token',
        'Authorization'
      ],
      maxAge:86400,
      credentials: true,
      methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
      origin:"*",
      preflightContinue: false,
    };
  }

  /**
   * This method is responsible to instantiates all Controllers classes and add to the Server Array property related to it
   *
   * @author Rômulo Ramos
   * @param -
   * @return -
  */
  private setupControllers(): void {
    const usersController = new UserController();
    const listsController = new ListsController();
    const itemsController = new ItemsController();
    const authController = new AuthController();
    this.addControllers([authController,usersController,listsController, itemsController]);
  }

  /**
   * This method is responsible to instantiates Database class
   *
   * @author Rômulo Ramos
   * @param -
   * @return -
  */
  private setupDatabase(): void{
    this.dbInstance = new Database();
    if(!this.dbInstance){
      throw new Error("setupDatabase: Database Instance fail!");
    }
  }

  private async docSetup(): Promise<void>{
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSchema));
  }

  /**
   * This method is responsible to Server Initialization, calling all setup methods
   *
   * @author Rômulo Ramos
   * @param -
   * @return -
  */
  public async init(): Promise<void> {
    this.setupExpress();
    await this.docSetup();
    this.setupDatabase();
    this.setupControllers();
  }

  /**
   * This method is responsible to starts the Server Service
   *
   * @author Rômulo Ramos
   * @param -
   * @return -
  */
  public start(): void {
    this.server = this.app.listen(this.port, () => {
      console.info('Server listening of port: ', this.port);
    });
  }

  /**
   * This method is responsible to a right stops to the Server Service, making the database disconnection
   *
   * @author Rômulo Ramos
   * @param -
   * @return -
  */
  public async close(): Promise<void>{
    await this.dbInstance.disconnect();
    if (this.server) {
      await new Promise((resolve, reject) => {
        this.server?.close((err) => {
          if (err) {
            return reject(err);
          }
          resolve(true);
        });
      });
    }
  }

  /**
   * This method is responsible return the Application to make possible functional tests 
   *
   * @author Rômulo Ramos
   * @param -
   * @return Application type from express
  */
  public getApp():Application{
    return this.app;
  }
}
