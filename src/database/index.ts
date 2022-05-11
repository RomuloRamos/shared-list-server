import {PrismaClient} from '@prisma/client';
import {LogRegister} from '@src/util/logRegister';
import { UserTable, iUser } from './user';
import { ListsTable, iLists } from './lists';
import { ItensTable, iItens } from './itens';

export type iUserDb = iUser;
export type iListsDB = iLists;
export type iItensDB = iItens;
export class Database {

    private static instance: Database
    // private className!:string;
    private pvDbClient!: PrismaClient;
    private pvLog!:LogRegister;
    public ModelUser!: UserTable;
    public ModelList!: ListsTable;
    public ModelItens!: ItensTable;

    constructor(){
        if(Database.instance){
            Database.instance.pvLog.log("Database.constructor: returning previously allocated instance...")
            return Database.instance;
        }
        this.pvLog = new LogRegister();
        this.pvLog.log("returning a new instance...");
        Database.instance = this;
        this.pvDbClient = new PrismaClient();
        this.setupModels();
    }

    private setupModels(): void{
        this.pvLog.log("Calling to Models intanciation");
        if(this.pvDbClient){
            try {
                this.ModelUser = new UserTable(this.pvDbClient);
                this.ModelList = new ListsTable(this.pvDbClient);
                this.ModelItens = new ItensTable(this.pvDbClient);
            } catch (error) {
                const message ="Models instanciation FAIL"; 
                this.pvLog.log(message);
                throw new Error(message);
            }
        } else {
            const message ="DbClient wasn't instaciated"; 
            this.pvLog.log(message);
            throw new Error(message);
        }
    }

    public async connect(): Promise<void>{
        await this.pvDbClient.$connect();
    }

    public async disconnect(): Promise<void>{
        await this.pvDbClient.$disconnect();
    }
}
