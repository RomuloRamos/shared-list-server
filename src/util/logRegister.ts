
export class LogRegister {

    // private logLevel!:number;
    
    constructor(private logLevel = 3){
    }

    public log(message:unknown, levelMessage=this.logLevel): void{      
        if(levelMessage>=this.logLevel)
        {
          const caller = this.caller(); 
          console.info(caller+": ",message);
        }
    }
    
  private caller() {

    const errorStack = new Error();

    const allMatches = errorStack.stack?.match(/at \w+.\w+|at/g);
    if(allMatches)
    {
      let strResult = allMatches[2].replace(/at\s|at/g, "");
      if(strResult.length > 0)
      {
        return strResult;
      }
      else 
      {
        strResult = allMatches[5].replace(/at\s/g, "");
        return strResult;
      }
    }   
    return " ";
  }
}
