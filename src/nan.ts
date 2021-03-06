import Vector from './utils/vector';
import GameObject from './object/gameobject';
import EventManager from './event/eventmanager';

export default class Nan {
  private static instance: unknown; // 单例

  private fps = 30; // 帧率

  private eventManager: EventManager = new EventManager();

  private lastUpdateTime = 0;

  private mousePosX = 0;// canvas中的screen位置

  private mousePosY = 0;// canvas中的screen位置

  private leftTopObj: GameObject | undefined; // 左上边界对象

  private rightBottomObj: GameObject | undefined; // 右下边界对象

  public originPosition: Vector<number> = new Vector(0, 0);

  public originScale: Vector<number> = new Vector(1, 1);

  public context: CanvasRenderingContext2D; // Canvas渲染器

  public objList: Array<GameObject> = []; // 已加载的物体列表

  public canvasDraggable = true; // 画布可否可拖拽

  public canvasScalable = true; // 画布是否可缩放

  public autoUpdate = false;

  public scale = 1;

  /**
   *  构造函数初始化
   * @param canvas Canvas对象
   * @param fps 刷新帧率
   */
  constructor(canvas: HTMLCanvasElement) {
    if (Nan.instance) { console.error('Nan is already created, You can use getInstance() to get it'); } else { Nan.instance = this; }
    if (!canvas) { console.error("Canvas can't be null"); }
    this.context = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.init();
  }

  /**
 * 初始化
 */
  init() {
    this.eventManager.init();
    if (this.autoUpdate) {
      setInterval(Nan.update, 1000 / this.fps);
    }
  }

  /**
   * 获取单例
   * @returns 单例
   */
  static getInstance(): Nan {
    return Nan.instance as Nan;
  }

  /**
   * 获取Canvas渲染器
   * @returns Canvas渲染器
   */
  getContext(): CanvasRenderingContext2D {
    return this.context;
  }

  // 清屏
  static clear() {
    const nan = Nan.getInstance();
    const cleanX = nan.originPosition.x / nan.scale;
    const cleanY = nan.originPosition.y / nan.scale;
    const canvasWidth = nan.context.canvas.width;
    const canvasHeight = nan.context.canvas.height;
    nan.context.clearRect(
      cleanX,
      cleanY,
      canvasWidth / nan.originScale.x,
      canvasHeight / nan.originScale.y,
    ); // 清屏
  }

  /**
   * 更新
   */
  public static update() {
    const nan = Nan.getInstance();
    Nan.clear();

    for (let i = 0; i < nan.objList.length; i += 1) {
      const gameObject: GameObject = nan.objList[i];
      gameObject.beforeUpdate();
      gameObject.updateNanObjects();
    }
    nan.lastUpdateTime = Date.now();
  }

  /**
   * update执行后执行
   */
  private static updated() {
    const nan = Nan.getInstance();
    for (let i = 0; i < nan.objList.length; i += 1) {
      const gameObject: GameObject = nan.objList[i];
      gameObject.updated();
    }
  }

  /**
   * 渲染
   */
  public static render() {
    const nan = Nan.getInstance();
    if (Date.now() - nan.lastUpdateTime > 30) {
      this.update();
      this.updated();
      return true;
    }
    return false;
  }

  /**
   * 添加GameObject对象
   * @param obj GameObject对象
   */
  add(obj: GameObject, autoUpdate = true) {
    if (!obj.update) {
      console.warn("The gameobject named %s hasn't return any NanObject in update()", obj.name);
    }
    this.objList.push(obj);
    if (!autoUpdate) {
      Nan.render();
    }
  }

  /**
   * 查询Nan对象
   * @param name 名称
   * @returns Nan对象
   */
  findGameObject(name: string): GameObject | null {
    let result: GameObject | null = null;
    for (let i = 0; i < this.objList.length; i += 1) {
      const obj: GameObject = this.objList[i];
      if (obj.name === name) {
        result = obj;
      }
    }
    return result;
  }

  /**
   * 移动坐标原点并记录
   * @param x x
   * @param y y
   */
  translateOrigin(x: number, y: number) {
    this.context.translate(x, y);
    this.originPosition = new Vector(
      this.originPosition.x - x * this.scale,
      this.originPosition.y - y * this.scale,
    );
    if (!this.autoUpdate) {
      Nan.render();
    }
  }

  /**
   * 移动“到”坐标原点并记录
   * @param x x
   * @param y x
   */
  moveOrigin(x: number, y: number) {
    this.translateOrigin(this.originPosition.x + x, this.originPosition.y + y);
  }

  /**
   * 缩放画布
   * @param x x
   * @param y x
   */
  // TODO 以中心缩放
  scaleOrigin(x: number) {
    if (this.scale < 0.12 && x < 1) return;
    if (this.scale > 4 && x > 1) return;

    const oldscale = this.scale;
    this.scale *= x;
    this.context.scale(x, x);
    this.originScale = new Vector(this.originScale.x * x, this.originScale.y * x);
    this.translateWhenScale(oldscale); // 在新的scale比例下，原点位置的迁移
    if (!this.autoUpdate) {
      Nan.render();
    }
  }

  translateWhenScale(scale: number) {
    const mousePos = this.getMousePos();
    const canvasBound = this.context.canvas.getBoundingClientRect();
    const transX = (-this.originPosition.x - mousePos.x)
    * (((this.scale - scale) / scale) / this.scale);
    const transY = (-this.originPosition.y - mousePos.y)
    * (((this.scale - scale) / scale) / this.scale);

    this.translateOrigin(transX, transY);

    if (this.leftTopObj) { // 左上对象超过右下边界
      if (-this.originPosition.x > canvasBound.width - 10
        || -this.originPosition.y > canvasBound.height - 10) {
        this.translateOrigin(
          this.originPosition.x * this.scale,
          this.originPosition.y * this.scale,
        );
      }
    }

    if (this.rightBottomObj) { // 右下对象超过左上边界
      if (this.originPosition.x / this.scale > this.rightBottomObj.transform.position.x
        || this.originPosition.y / this.scale > this.rightBottomObj.transform.position.y) {
        console.log('trans2', this.originPosition, this.rightBottomObj.transform.position);
        this.translateOrigin(this.originPosition.x, this.originPosition.y);
      }
    }
  }

  // 取鼠标的screen相对位置
  getMousePos() {
    const x = this.mousePosX;
    const y = this.mousePosY;
    return { x, y };
  }

  // 设置鼠标的screen位置
  setMousePos(x: number, y: number) {
    this.mousePosX = x;
    this.mousePosY = y;
  }

  setBoundaryObj(leftTop: GameObject, rightBottom: GameObject) {
    this.leftTopObj = leftTop;
    this.rightBottomObj = rightBottom;
    console.log(leftTop.transform.position, rightBottom.transform.position);
  }
}
