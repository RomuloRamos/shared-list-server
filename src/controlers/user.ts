import {Request, Response} from 'express';
import  {HttpStatusCode} from '@src/util/http-status-code';
import {Controller, Get, Post, Put, Middleware} from '@overnightjs/core';
import {Database,iUserDb} from '@src/database';
import {LogRegister} from '@src/util/logRegister';
import {AuthController} from '@src/controlers/auth';

@Controller('api/v0/users')
export class UserController {

    private db!:Database;
    private userDb;
    private pvLog!:LogRegister;

    constructor(){
        this.pvLog = new LogRegister();
        this.db = new Database();
        this.userDb = this.db.ModelUser;
        this.pvLog.log("New Instance created!");
    }

    @Get(':id')
    @Middleware(AuthController.authValidate)
    public async getUser(req:Request, res:Response): Promise<void>{
        try {
            if(req.params.id)
            {
                const userId = parseInt(req.params.id as string);
                const {HttpStatus, Result} = await this.userDb.getOneById(userId)   
                .then(result=>{
                    let HttpStatus = HttpStatusCode.OK;
                    if(!result) HttpStatus = HttpStatusCode.NO_CONTENT;
                    return {
                        HttpStatus,
                        Result: result
                    }
                })
                .catch(error =>{
                    this.pvLog.log("ERROR: /n"+error.message);
                    return {
                        HttpStatus: HttpStatusCode.BAD_REQUEST,
                        Result: error.message  
                    }
                })
                res.status(HttpStatus).send({user:Result});
            }  
            else if(req.params.email){
                const userEmail:string = req.params.email as string;
                const {HttpStatus, Result} = await this.userDb.getOneByEmail(userEmail)
                .then(result=>{
                    let HttpStatus = HttpStatusCode.OK;
                    if(!result) HttpStatus = HttpStatusCode.NO_CONTENT;
                    return {
                        HttpStatus,
                        Result: result
                    }
                })
                .catch(error =>{
                    this.pvLog.log("ERROR: /n" + error.message);
                    return {
                        HttpStatus: HttpStatusCode.BAD_REQUEST,
                        Result: error.message  
                    }
                })
                res.status(HttpStatus).send({user:Result});
            }
            else throw new Error("Invalid Query")
        }
        catch (error) {
            this.pvLog.log("ERROR: /n" + error);
            res.status(HttpStatusCode.BAD_REQUEST).send({error:"Invalid Query"});
        }
    }

    @Post('')
    @Middleware(AuthController.authValidate)
    public async createUser(req:Request, res:Response): Promise<void>{
        this.pvLog.log("called...");
        try {
            let iNewUser:iUserDb = req.body;
            const {HttpStatus, Result} = await this.userDb.create(iNewUser)
            .then(result =>{
                return {
                    HttpStatus: HttpStatusCode.CREATED,
                    Result: result
                }
            })
            res.status(HttpStatus).send({user:Result});
        } catch (error:any) {
            this.pvLog.log("ERROR: /n" + error);
            res.status(HttpStatusCode.BAD_REQUEST).send({error:"Creation Fail"})
        }
    }

    @Put(':id')
    @Middleware(AuthController.authValidate)
    public async update(req:Request, res: Response): Promise<void>{
        this.pvLog.log("called...");
        try {
            let iUserUpdate:iUserDb = req.body;
            iUserUpdate.id = parseInt(req.params.id as string);
            this.pvLog.log(iUserUpdate);
            const {HttpStatus, Result} = await this.userDb.update(iUserUpdate,0)
            .then((result:iUserDb) =>{
                if(result.id){
                    return {
                        HttpStatus: HttpStatusCode.CREATED,
                        Result: result
                    }
                }
                return {
                    HttpStatus: HttpStatusCode.BAD_REQUEST,
                    Result: result
                }
            })
            res.status(HttpStatus).send({user:Result});
        } catch (error) {
            this.pvLog.log(error);
            res.status(HttpStatusCode.BAD_REQUEST).send({error:"Update Fail"})
        }

    }
}