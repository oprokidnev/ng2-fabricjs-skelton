import {Component, Input, OnInit, Injectable} from 'angular2/core';
import {Promise} from 'es6-promise';
import {Observable} from 'rxjs/Observable';
import {UPLOAD_DIRECTIVES} from 'ng2-uploader/ng2-uploader';
import {HTTP_PROVIDERS, Http, Request, Response, RequestMethod, Headers, RequestOptions} from 'angular2/http';


type ResolveImages<T> = [T];

interface IPostData {
    fileId:number|void,
    fileUri:string|void,
    left:number,
    top:number,
    width:number
}
enum Gender {
    Man = 1,
    Women = 0
}

@Injectable()
export class UrlSet {
    constructor(public uploadUrl:string, public saveUrl:string, public onFinish: (args:any) => any, public baseUrl:string, public gender:Gender = Gender.Women){
        
    }
}

@Component({
  selector: 'image-selector',
  providers: [],
  pipes: [],
  directives: [UPLOAD_DIRECTIVES],
  styles:[
      require('./css/image-selector.css').toString() 
  ],
  template: require('./image-selector.html')
})
export class ImageSelector {
    
    fileId: number|void;
    uploadFile: any;
    viewport: fabric.ICanvas;
    image: fabric.IImage;
    frame: fabric.IImage;
    loaded:number = 0;
    saveUrl:string = '';
    fileSelectOptions: any = {
        url: ''
    };
    
    url:string = 'http://nomination-ubrr.localhost';
    constructor(protected http:Http, protected urlset:UrlSet) {
        this.fileSelectOptions.url = urlset.uploadUrl;
        this.saveUrl = urlset.saveUrl;
        this.onFinish = urlset.onFinish;
        this.url = urlset.baseUrl;
    }
    
    protected loadImage(path): Promise<fabric.IImage>{
        
        let canvas = this.viewport;
        if(this.image){
            canvas.remove(this.image);
        }
        
        return new Promise( (resolve, reject) => {
            fabric.Image.fromURL(path, (image):void => {
                image.lockUniScaling = true;
                
                if (image.getWidth() > Math.min(590,canvas.getWidth()) || image.getHeight() > Math.min(590,canvas.getHeight())) {
                    let scaleX = Math.min(590,canvas.getHeight()) / image.getWidth();
                    let scaleY = Math.min(590,canvas.getHeight()) / image.getHeight();
                    let scale = Math.min(scaleX,scaleY);
                    image.setScaleX(scale);
                    image.setScaleY(scale);
                    // image.setWidth(200);
                }
                canvas.add(image);
                resolve(image);
            });
        });
    }
    
    protected reload(resolveImages: Promise<ResolveImages<fabric.IImage>>){
        let canvas = this.viewport;
        
        resolveImages.then( ([image])=>{
            canvas.deactivateAll().renderAll();
            
            canvas.moveTo(image, 20);
            image.setLeft(18);
            image.setTop(5);
            canvas.setActiveObject(image);
            this.image = image;
        });
  }
  /**
   * 
   */
  public scaleUp(){
      let scale:number = this.image.getScaleX();
      scale+=0.1;
      this.image.setScaleX(scale);
      this.image.setScaleY(scale);
      this.viewport.renderAll();
  }
  /**
   * 
   */
  public scaleDown(){
      let scale:number = this.image.getScaleX();
      scale-=0.1;
      this.image.setScaleX(scale);
      this.image.setScaleY(scale);
      this.viewport.renderAll();
  }
  
  /**
   * onInit
   */
  public ngOnInit() {
      
    let canvas = new fabric.Canvas('image-container-workspace');
    this.viewport = canvas;
    canvas.setWidth(660)
    canvas.setHeight(600)
    
    let loadFrame = new Promise( (resolve, reject) => {
        fabric.Image.fromURL(require('./img/image-selector.png'), (frame):void => {
            this.frame = frame; 
            canvas.setOverlayImage(frame, resolve, {
                width: frame.getWidth(),
                height: frame.getHeight(),
                originX: 'left',
                originY: 'top',
                left:canvas.getWidth()-frame.getWidth()
            });
        });
    });
    
    let defaultImage = this.urlset.gender == Gender.Women ? require('./img/image-woman.png') : require('./img/image-man.png');
    let loadImage = this.loadImage(defaultImage);
    
    let resolveImages: Promise<ResolveImages<fabric.IImage>> = Promise.all([loadImage, loadFrame]);
    
    this.reload(resolveImages);
        
  }
  /**
   * upload
   */
  public onUpload(data) : void {
    if (data && data.response) {
      data = JSON.parse(data.response);
      this.uploadFile = data;
      
      let fileUrl = data.url;
      this.fileId = data.id;
      
      let resolveImages: Promise<ResolveImages<fabric.IImage>> = Promise.all([this.loadImage(`${this.url}${fileUrl}`)]);
      this.reload(resolveImages);
    }
  }
  protected getPostData():IPostData{
      return {
          fileId:this.fileId,
          fileUri:this.image.getSrc(),
          left:this.image.getLeft(),
          top:this.image.getTop(),
          width:this.image.getWidth(),
      };
  }
  
  public onFinish(...args: any[]):void{
      console.log(this);
      this.urlset.onFinish(args);
  }
  
  /**
   * save
   */
  public save() {
      let onFinish = this.onFinish;
      let body = JSON.stringify(this.getPostData());
      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers,
          body:body,
          method:'POST'
         });

    //   console.log(this.getPostData());
    //   let xhr:Observable<Object> = this.http
    //     .post(, body, options );
        
      let xhr:Observable<Object> = this.http.request(this.saveUrl, options);
    //   console.log(xhr, onFinish);
      xhr.subscribe((res:any):void => {
        //   console.log(res);
            let data = res.json();
            this.onFinish(data);
        // Response came from mock backend
      });
  }
}
