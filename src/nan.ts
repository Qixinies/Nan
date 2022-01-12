import {NanObject} from 'object/nanobject'
import {Sprite} from 'object/sprite'

export class Nan {  
  private ctx: CanvasRenderingContext2D;
  private objList: Array<NanObject> = [];
  private static instance:Nan;
  private fps: number;

  constructor(canvas: HTMLCanvasElement, fps: number = 60) {
    if(Nan.instance) 
      console.error("Nan is already created, You can use getInstance() to get it");          
    else 
      Nan.instance = this;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;    
    this.fps = fps;
    this.init();
  }

  static getInstance(): Nan {
    if(!Nan.instance) {
      console.error("Nan have not been create,Please create Nan first");
    }
    return Nan.instance;
  }

  getCtx(): CanvasRenderingContext2D {
    return this.ctx;
  }

  init() {
    setInterval(this.update, 1000/this.fps);
  }


  update() {
    let nan = Nan.getInstance();
    nan.ctx.clearRect(0, 0, nan.ctx.canvas.width, nan.ctx.canvas.height);
    for (let i = 0; i < nan.objList.length; i++) {
      let obj:NanObject = nan.objList[i];
      obj._update();
    }    
  }

  addObject(obj: NanObject) {   
    console.log("Add " + obj.name); 
    this.objList.push(obj);
  }

  findObject(name: String): NanObject | null {
    let result:NanObject | null = null;
    for (let i = 0; i < this.objList.length; i++) {
      let obj: NanObject = this.objList[i];
      if (obj.name == name) {
        result = obj;
      }
    }
    if (!result) {
      console.error("Can't find object by name: %s", name);
    }
    return result;
  }

}