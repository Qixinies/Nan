import NanObject from './nanobject';
import Transform from '../utils/transform';
import Vector from '../utils/vector';
/**
 * Sprite类
 * 渲染图片的对象都属于Sprite类，Sprite类属于Nan对象
 */
export default class Sprite extends NanObject {
  public image: CanvasImageSource; // 图像

  /**
   * 构造函数
   * @param name 对象名称
   * @param transform 变换信息
   * @param image 图像
   */
  constructor(transform: Transform, image: CanvasImageSource, autoSize = true) {
    super(transform);
    this.image = image;
    if (autoSize) {
      this.transform.size = new Vector(image.width as number, image.height as number);
    } else {
      this.transform.size = transform.size;
    }
  }

  /**
   * 内部帧更新函数
   */
  update() {
    this.context.save();
    this.context.beginPath();
    super.update();

    this.context.drawImage(
      this.image,
      this.transform.position.x,
      this.transform.position.y,
      this.transform.size.x,
      this.transform.size.y,
    );

    this.context.closePath();
    this.context.restore();
  }

  /**
   * 设置图像
   * @param image 图像
   */
  setImage(image:CanvasImageSource) {
    this.image = image;
  }
}
