import NanObject from "./nanobject";
import Vector from "../utils/vector";
import Transform from "utils/transform";

export default class NLine extends NanObject {
  public path: Vector;
  
  /**
   * 
   * @param transform 变换信息
   * @param path 线段路径信息，必须要一个二维数组（Vector）的二维数组。path.x为起始点,path.y为结束点
   */
  constructor(transform: Transform, path: Vector){
    if(path.x.x && path.x.y && path.y.x && path.y.y) {
      console.error("The variable path must be a Vector of Vector")
    }
    transform.size.x = Math.abs(path.x.x - path.y.x)
    transform.size.y = Math.abs(path.x.y - path.y.y);
    super(transform);    
    this.path = path;    
  }

  _update(): void {     
    super._update();
    let pos: Vector = this.transform.position;
    this.context.moveTo(this.path.x.x + pos.x, this.path.x.y + pos.y);
    this.context.lineTo(this.path.y.x + pos.x, this.path.y.y + pos.y);
    this.context.stroke();    
    super._lateUpdate();
  }
}