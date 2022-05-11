import {Request, Response} from 'express';
import  {HttpStatusCode} from '@src/util/http-status-code';
import {Controller, Get, Post, Delete, Put, ClassMiddleware} from '@overnightjs/core';
import {Database, iItensDB} from '@src/database';
import {LogRegister} from '@src/util/logRegister';
import {AuthController} from '@src/controlers/auth';

@Controller('items')
@ClassMiddleware(AuthController.authValidate)
export class ItemsController {

    private db!:Database;
    private itemsDb;
    public className!:string;
    private pvLog!:LogRegister;

    constructor(){
        this.db = new Database();
        this.itemsDb = this.db.ModelItens;
        this.pvLog = new LogRegister();
        this.pvLog.log("New Instance created!");
    }

    @Get(':id')
    public async getItem(req:Request, res:Response): Promise<void>{
        this.pvLog.log("called...");
        try {
            if(req.params.id){
                const itemId = parseInt(req.params.id as string);
                const {HttpStatus, Result} = await this.itemsDb.getOneById(itemId)
                .then(result=>{
                    let HttpStatus = HttpStatusCode.OK;
                    if(!result) HttpStatus = HttpStatusCode.NO_CONTENT;
                    return {
                        HttpStatus,
                        Result: result
                    }
                })
                res.status(HttpStatus).send(Result);
            }
            else throw new Error("Invalid Query");
        } catch (error) {
            this.pvLog.log("ERROR: /n" + error);
            res.status(HttpStatusCode.BAD_REQUEST).send({message:"Invalid Query"});
        }
    }

    @Get('by-owner')
    public async getItemsByOwner(req:Request, res:Response): Promise<void>{
        this.pvLog.log("called...");
        try {
            if(req.query.id){
                const receivedQuery:string = req.query.id as string;
                const ownerId = parseInt(receivedQuery);
                const {HttpStatus, Result} = await this.itemsDb.getByOwner(ownerId)
                .then(result=>{
                    let HttpStatus = HttpStatusCode.OK;
                    if(!result) HttpStatus = HttpStatusCode.NO_CONTENT;
                    return {
                        HttpStatus,
                        Result: result
                    }
                })
                res.status(HttpStatus).send(Result);
            }
            else throw new Error("Invalid Query");
        } catch (error) {
            this.pvLog.log("ERROR: /n" + error);
            res.status(HttpStatusCode.BAD_REQUEST).send(error);
        }
    }

    @Get('list/:id')
    public async getItemsByList(req:Request, res:Response): Promise<void>{
        this.pvLog.log("called...");
        try {
            if(req.params.id){
                const receivedQuery:string = req.params.id as string;
                const listId = parseInt(receivedQuery);
                const {HttpStatus, Result} = await this.itemsDb.getByList(listId)
                .then(result=>{
                    let HttpStatus = HttpStatusCode.OK;
                    if(!result) HttpStatus = HttpStatusCode.NO_CONTENT;
                    return {
                        HttpStatus,
                        Result: result
                    }
                })
                res.status(HttpStatus).json({items:Result});
            }
            else throw new Error("Invalid Query");
        } catch (error) {
            this.pvLog.log("ERROR: /n" + error);
            res.status(HttpStatusCode.BAD_REQUEST).send(error);
        }
    }

    @Post('')
    public async createItem(req:Request, res:Response): Promise<void>{
        this.pvLog.log("called...");
        try {
            const newItem:iItensDB = req.body.item;
            const {HttpStatus, Result} = await this.itemsDb.create(newItem)
            .then(result =>{
                return {
                    HttpStatus: HttpStatusCode.CREATED,
                    Result: result
                }
            })
            res.status(HttpStatus).send({item:Result});
        } catch (error) {
            this.pvLog.log("ERROR: /n" + error);
            res.status(HttpStatusCode.BAD_REQUEST).send({message:"Invalid insertion"})
        }
    }

    @Put(':id')
    public async update(req: Request, res: Response): Promise<void>{
        this.pvLog.log("called...");
        try {
            const newItem:iItensDB = req.body.item;
            newItem.id = parseInt(req.params.id as string);
            const {HttpStatus, Result} = await this.itemsDb.update(newItem)
            .then(result =>{
                return {
                    HttpStatus: HttpStatusCode.OK,
                    Result: result
                }
            })
            res.status(HttpStatus).send({item:Result});
        } catch (error) {
            this.pvLog.log("ERROR: /n" + error);
            res.status(HttpStatusCode.BAD_REQUEST).send({message:"Invalid Update insertion"})
        }
    }

    @Delete(':id')
    public async delete(req:Request, res:Response): Promise<void>{
        this.pvLog.log("called...");
        try {
            if(req.params.id){
                const itemId = parseInt(req.params.id as string);
                const {HttpStatus, Result} = await this.itemsDb.delete(itemId)
                .then(result =>{
                    return {
                        HttpStatus: HttpStatusCode.OK,
                        Result: result
                    }
                })
                res.status(HttpStatus).send({id:Result.id});
            }
            else throw new Error("Invalid Query");    
        } catch (error) {
            this.pvLog.log("ERROR: /n" + error);
            res.status(HttpStatusCode.BAD_REQUEST).send({message:"Invalid delete attempt"});
        }
    }
}