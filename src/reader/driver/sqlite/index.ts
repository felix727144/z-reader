import { workspace } from 'vscode';
import * as Fs from 'fs';
import * as iconv from 'iconv-lite';
import { ReaderDriver as ReaderDriverImplements } from '../../../@types';
import { TreeNode, defaultTreeNode } from '../../../explorer/TreeNode';
import {Database,Statement,OPEN_READONLY} from 'sqlite3';

class ReaderDriver implements ReaderDriverImplements {
  private inited:boolean=false;
  private db:Database|undefined;
  public init():Promise<boolean>{

    return new Promise((resolve):void => {
      this.db=new Database('C:\\Workdir\\sisdown\\testnewbak.db',OPEN_READONLY,(err:Error|null):void=>{
        if( err instanceof Error ){
          this.db=undefined
          this.inited=false;
          resolve(false);
        }else{
          this.inited=true;
          resolve(true);
        }
      });
    });
    // if(this.inited)return true;
    // this.db=new Database('C:\\Workdir\\sisdown\\testnewbak.db',OPEN_READONLY,(err:Error|null)=>void{
    //   //console.warn('sqlite inited')
    //   //if(err){
    //   //  //this.inited=true;
    //  // }
    // });
    
    // return true;
  }
  private getEncoding() {
    const vConfig = workspace.getConfiguration('z-reader');
    return vConfig.get('encoding', 'utf8');
  }

  public getContent(path: string): Promise<string> {
    //console.log('sqlite,getContent',path);
    let result = '读取失败';
    let ret=new Promise<string>(async (resolve)=>{
      await this.init();
      if(this.inited){
        this.db?.each('SELECT content FROM thread WHERE id=?',[path],(err:Error,row:any)=>{
          if(err instanceof Error){
            result='No such article';
          }else{
            result=row.content;
          }
          resolve(result);
        })

      }else{
        resolve(result);
      }
    });
    
    return ret;
  }
  public getBookList():Promise<TreeNode[]>{
    return new Promise<TreeNode[]>(async (resolve)=>{
      let result: TreeNode[] = [];
      await this.init();
      if(this.inited){
        this.db?.all('SELECT id,title,rtitle,type,author,content_length FROM thread WHERE content_length>10000 ORDER BY content_length DESC',(err:Error,rows:Object[])=>{
          if(err instanceof Error){
            //result='No such article';
          }else{
            for(let i=0;i<rows.length;i++){
              let row:any=rows[i];
              let name=(row.type?('['+row.type+'] '):'')+((row.rtitle)?row.rtitle:row.title) + ((row.author)?('  {'+row.author+'}'):'') + '  '+row.content_length;
              //console.log(name,type,typeof row.type ,!row.type,'['+row.type+'] ',row.title)
              result.push(new TreeNode(
                Object.assign({}, defaultTreeNode, {
                  type: '.sqlite',
                  name: name,
                  isDirectory: false,
                  path: row.id+''
                })
              ));
            }
            
          }
          resolve(result);

        })
        //resolve(result);
      }else{
        resolve(result);
      }
    });
  }
  public getChapter() {
    const result: TreeNode[] = [];
      
    result.push(
      new TreeNode(
        Object.assign({}, defaultTreeNode, {
          type: '.sqlite',
          name:"test",
          isDirectory: false,
          path:"test"
        })
      )
    );
  
    return result;
  }
  public hasChapter() {
    return false;
  }
}
export const readerDriver = new ReaderDriver();
