import {Request, Response,NextFunction} from 'express';
import  {HttpStatusCode} from '@src/util/http-status-code';
import {Controller, Get, Post, Delete, Put, ClassOptions, ChildControllers, Children,Middleware} from '@overnightjs/core';
import {Database, iListsDB,iItensDB} from '@src/database';
import {LogRegister} from '@src/util/logRegister';
import {AuthController} from '@src/controlers/auth';
import { ItemsController } from './items';

@Controller('api/v0/lists')
// @ClassOptions({mergeParams: true})
// @Children(new ItemsController(),)
export class ListsController {

    private db!:Database;
    private listsDb;
    public className!:string;
    private pvLog!:LogRegister; 
    private itemsController:ItemsController;

    constructor(){
        this.db = new Database();
        this.listsDb = this.db.ModelList;
        this.pvLog = new LogRegister();
        this.pvLog.log("New Instance created!");
        this.itemsController = new ItemsController();
    }

    @Get()
    public async getList(req:Request, res:Response): Promise<void>{
        try {
            const listId = parseInt(req.query.id as string);
            const {HttpStatus, Result} = await this.listsDb.getOneById(listId)
            .then(result=>{
                let HttpStatus = HttpStatusCode.OK;
                if(!result){
                    return{
                        HttpStatus: HttpStatusCode.NO_CONTENT,
                        Result: {message:"List id not found!"}
                    }
                } 
                return {
                    HttpStatus,
                    Result: {
                        list: {title:result.title},
                        user_id: result.authorId
                    }
                }
            })
            res.status(HttpStatus).send({list:Result});
        }catch (error:any){
            this.pvLog.log("ERROR: /n" + error);
            res.status(HttpStatusCode.BAD_REQUEST).send({message:"Invalid Query"});
        }
    }

    @Get(':id')
    public async getOneList(req:Request, res:Response,next:NextFunction): Promise<void>{
        try {
            const listId = parseInt(req.params.id as string);
            const {HttpStatus, Result} = await this.listsDb.getOneById(listId)
            .then(result=>{
                let HttpStatus = HttpStatusCode.OK;
                if(!result){
                    return{
                        HttpStatus: HttpStatusCode.NO_CONTENT,
                        Result: {message:"List id not found!"}
                    }
                } 
                return {
                    HttpStatus,
                    Result: {
                        list: {title:result.title},
                        user_id: result.authorId
                    }
                }
            })
            res.status(HttpStatus).send(Result);
        }catch (error:any){
            this.pvLog.log("ERROR: /n" + error);
            res.status(HttpStatusCode.BAD_REQUEST).send({message:"Invalid Query"});
        }
    }

    @Get(':id/items')
    @Middleware(AuthController.authValidate)
    public async getListItems(req:Request, res:Response): Promise<void>{
        try {
            const listId = parseInt(req.params.id as string);
            await this.itemsController.getItemsByList(req, res);
        }catch (error:any){
            this.pvLog.log("ERROR: /n" + error);
            res.status(HttpStatusCode.BAD_REQUEST).send({message:"Invalid Query"});
        }
    }

    @Post('')
    public async createList(req:Request, res:Response): Promise<void>{
        try {
            const newList:iListsDB = req.body;
            const {HttpStatus, Result} = await this.listsDb.create(newList)
            .then(result =>{
                return {
                    HttpStatus: HttpStatusCode.CREATED,
                    Result: result
                }
            })
            res.status(HttpStatus).send({list:Result});
        } catch (error) {
            this.pvLog.log("ERROR: /n" + error);
            res.status(HttpStatusCode.BAD_REQUEST).send({message:"Invalid insertion"})
        }
    }

    @Post(':id/items')
    @Middleware(AuthController.authValidate)
    public async createListItems(req:Request, res:Response): Promise<void>{
        try {
            const listId = parseInt(req.params.id as string);
            const newItem:iItensDB = {
                title: req.body.title,
                description: req.body.description,
                ownerId: req.body.user_id,
                listId: listId,
                parentId:null
            };
            req.body.item = newItem;
            await this.itemsController.createItem(req, res);
        }catch (error:any){
            this.pvLog.log("ERROR: /n" + error);
            res.status(HttpStatusCode.BAD_REQUEST).send({message:"Invalid Query"});
        }
    }

    @Put('')
    public async update(req: Request, res: Response): Promise<void>{
        try {
            const newList:iListsDB = req.body;

            const {HttpStatus, Result} = await this.listsDb.update(newList)
            .then((result) =>{
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
            .catch(error =>{
                this.pvLog.log("Update proccess error");
                this.pvLog.log(error);
                return {
                    HttpStatus: HttpStatusCode.BAD_REQUEST,
                    Result: error 
                }
            })
            res.status(HttpStatus).send({Result});
        } catch (error) {
            this.pvLog.log("ERROR");
            this.pvLog.log(error);
            res.status(HttpStatusCode.BAD_REQUEST).send({error})
        }
    }

    @Put(':id/items/:id_item')
    @Middleware(AuthController.authValidate)
    public async updateListItem(req: Request, res: Response): Promise<void>{
        try {
            const listId = parseInt(req.params.id as string);
            const itemId = parseInt(req.params.id_item as string);
            const newItem:iItensDB = {
                id: itemId,
                title: req.body.title,
                description: req.body.description,
                ownerId: req.body.user_id,
                listId: listId,
                parentId:null
            };
            req.body.item = newItem;
            req.params.id = req.params.id_item;
            await this.itemsController.update(req, res);
        }catch (error:any){
            this.pvLog.log("ERROR: /n" + error);
            res.status(HttpStatusCode.BAD_REQUEST).send({message:"Invalid Query"});
        }
    }

    @Delete(':id')
    @Middleware(AuthController.authValidate)
    public async delete(req:Request, res:Response): Promise<void>{
        try {
            const listId = parseInt(req.params.id as string);
            const {HttpStatus, Result} = await this.listsDb.delete(listId)
            .then(result =>{
                return {
                    HttpStatus: HttpStatusCode.OK,
                    Result: result
                }
            })
            res.status(HttpStatus).send({id:Result.id});
        } catch (error:any) {
            this.pvLog.log("ERROR: /n" + error);
            res.status(HttpStatusCode.BAD_REQUEST).send({message:"Invalid delete attempt"});
        }
    }

    @Delete(':id_list/items/:id')
    @Middleware(AuthController.authValidate)
    public async deleteItems(req:Request, res:Response): Promise<void>{
        try {
            await this.itemsController.delete(req, res);
        } catch (error:any) {
            this.pvLog.log("ERROR: /n" + error);
            res.status(HttpStatusCode.BAD_REQUEST).send({message:"Invalid delete attempt"});
        }
    }
}