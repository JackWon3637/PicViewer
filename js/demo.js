(function () {
  //变量声明
  var mouseFrom = {},
    mouseTo = {},
    drawType = null,
    canvasObjectIndex = 0,
    textbox = null;
  var drawWidth = 2; //笔触宽度
  var color = "#F43F61"; //画笔颜色
  // var drawingObject = null; //当前绘制对象
  // var textingObject = null; //当前显示文字对象
  var groupObject = null;//当前组合对象
  var moveCount = 1; //绘制移动计数器
  var doDrawing = false; // 绘制状态

  //初始化画板
  // initialize overlay初始化
  var options = {
    // scale: 1000
    scale: 2560
  };
  var overlay = openSeadragon.fabricjsOverlay(options);
  var canvas = new overlay.fabricCanvas('c',{
    isDrawingMode: true,
    skipOffscreen :true,
    skipTargetFind: true,
    selectable: false,
    selection: false
  });

  overlay.fabricCanvas().freeDrawingBrush.color = color; //设置自由绘颜色
  overlay.fabricCanvas().freeDrawingBrush.width = drawWidth;

   //自动更新放大倍数
   openSeadragon.addHandler('animation', updateZoom);
   //绑定画板事件
   var mouseDown = function(){overlay.fabricCanvas().on("mouse:down", function (options) {
    if(drawType){
    var can_zoom = zoomEl.innerHTML;
    var offset_x = overlay.fabricCanvas().calcOffset().viewportTransform[4];
    var offset_y = overlay.fabricCanvas().calcOffset().viewportTransform[5];
    openSeadragon.setMouseNavEnabled(!drawType);
     mouseFrom.x = Math.round(options.e.offsetX-offset_x);
     mouseFrom.y = Math.round(options.e.offsetY-offset_y);
     doDrawing = true;}
   });}
   var mouseUp = function(){overlay.fabricCanvas().on("mouse:up", function (options) {
    var can_zoom = zoomEl.innerHTML;
    var offset_x = overlay.fabricCanvas().calcOffset().viewportTransform[4];
    var offset_y = overlay.fabricCanvas().calcOffset().viewportTransform[5];
     mouseTo.x = Math.round(options.e.offsetX-offset_x);
     mouseTo.y = Math.round(options.e.offsetY-offset_y);
     groupObject = null;
     moveCount = 1;
     doDrawing = false;
     drawType=null;
     //将画图状态设置为非选择态
     jQuery("#toolsul").find("li").siblings().removeClass("active");
     openSeadragon.setMouseNavEnabled(true);
   });}
   var mouseMove = function(){overlay.fabricCanvas().on("mouse:move", function (options) {
     if(drawType){
     if (moveCount % 2 && !doDrawing) {
       //减少绘制频率
       return;
     }
     moveCount++;
     var can_zoom = zoomEl.innerHTML;
     var offset_x = overlay.fabricCanvas().calcOffset().viewportTransform[4];
     var offset_y = overlay.fabricCanvas().calcOffset().viewportTransform[5];
     mouseTo.x = Math.round(options.e.offsetX-offset_x);
     mouseTo.y = Math.round(options.e.offsetY-offset_y);
     drawing();}
   });}

  //病例信息的交互，展开和关闭
  $('#msgBar span').on("click",function(){
    $('.secondBar').show();
  });
  $('.close_sdbar').on("click",function(){
    $('.secondBar').hide();
  });

  //病例信息的窗口自适应
  var winHeight = $(window).height();//winHeight即浏览器高度
  var menuHeight = $("#sdbar_content").height();//菜单高度;其中menu_div为菜单所在标签的id
  var trueHig = function(hig){return hig-40;}
  if(menuHeight<winHeight){
    $("#sdbar_content").css("height",trueHig(winHeight));
  }
  else if(menuHeight>=winHeight){
    $("#sdbar_content").css("height",trueHig(auto));
  }

  //绑定工具事件
  jQuery("#toolsul").find("li").on("click", function () {
      //设置样式
      jQuery("#toolsul").find("li>i").each(function () {
        // attr() 方法设置或返回被选元素的属性值
        jQuery(this).attr("class", jQuery(this).attr("data-default"));
        });
      //移除与当前处于激活状态的相同类的激活状态，确保唯一性
      jQuery(this).addClass("active").siblings().removeClass("active");
      // .replace("black", "select")//代替以选中状态
      jQuery(this).find("i").attr("class",jQuery(this).find("i").attr("class"));
      drawType = jQuery(this).attr("data-type");
      if(drawType){
        if(drawType === "clear"){
          // overlay.fabricCanvas().on("mouse:down", function (options) {
        // 移除所有对象并且重新渲染
        overlay.fabricCanvas().clear(groupObject).renderAll();
      // });
      }else if(drawType){
        mouseDown();
        mouseMove();
        mouseUp();}
      }
      });

  //绘画方法
  function drawing() {
    if (groupObject) {
      //reomve仅将目前移除，clear清除上一残留，只剩当前
      overlay.fabricCanvas().remove(groupObject);
    }
    var can_zoom = zoomEl.innerHTML;
    var canvasObject = null;
    var textObject = null;
    var group = null;

    var lineLength=Math.round(Math.sqrt((mouseFrom.x-mouseTo.x)*(mouseFrom.x-mouseTo.x)+
      (mouseFrom.y-mouseTo.y)*(mouseFrom.y-mouseTo.y))/can_zoom);
    var middle={};
    var rectHeight = Math.round(Math.abs(mouseTo.y-mouseFrom.y)/can_zoom);
    var rectWidth = Math.round(Math.abs(mouseTo.x-mouseFrom.x)/can_zoom);

    var squreValue=Math.round(rectHeight*rectWidth/can_zoom);
    var arcValue=Math.round(rectHeight+rectWidth/can_zoom)*2;
    middle.x = Math.round((mouseFrom.x+mouseTo.x)/(2*can_zoom));
    middle.y = Math.round((mouseFrom.y+mouseTo.y)/(2*can_zoom));

    switch (drawType) {
      case "arrow": //箭头
        canvasObject = new fabric.Path(drawArrow(mouseFrom.x/can_zoom, mouseFrom.y/can_zoom, mouseTo.x/can_zoom, mouseTo.y/can_zoom, 30, 30), {
          stroke: color,
          fill: "rgba(255,255,255,0)",
          lockMovementX:true,
          lockMovementY:true,
          lockScalingX:true,
          lockScalingY:true,
          lockRolation:true,
          hasControls:false,
          selectionBackgroundColor:"rgba(100,100,100,0.25)",
          strokeWidth: drawWidth
        });
        textObject = new fabric.Text("长度："+lineLength+"px\n",{
          width:20,
          height:20,
          top:middle.y,
          left:middle.x,
          fontSize:24,
          opacity:0.6,
          textBackgroundColor:"#fefefe",
          });
        break;
      case "line": //直线
        canvasObject = new fabric.Line([mouseFrom.x/can_zoom, mouseFrom.y/can_zoom, mouseTo.x/can_zoom, mouseTo.y/can_zoom], {
          stroke: color,
          lockMovementX:true,
          lockMovementY:true,
          lockScalingX:true,
          lockScalingY:true,
          lockRolation:true,
          selectionBackgroundColor:"rgba(100,100,100,0.25)",
          strokeWidth: drawWidth
        });
        textObject = new fabric.Text("长度："+lineLength+"px\n",{
          width:20,
          height:20,
          top:middle.y,
          left:middle.x,
          fontSize:24,
          opacity:0.6,
          textBackgroundColor:"#fefefe",
          });
        break;
      case "circle": //正圆
        var left = mouseFrom.x,
            top = mouseFrom.y;
        var radius = Math.sqrt((mouseTo.x - left) * (mouseTo.x - left) + (mouseTo.y - top) * (mouseTo.y - top))/can_zoom;// /2
        canvasObject = new fabric.Circle({
          left: left/can_zoom,
          top: top/can_zoom,
          originX: 'center',
          originY: 'center',
          stroke: color,
          fill: "rgba(255, 255, 255, 0)",
          lockMovementX:true,
          lockMovementY:true,
          lockScalingX:true,
          lockScalingY:true,
          lockRolation:true,
          // borderColor:"rgba(255,255,255,0)",
          selectionBackgroundColor:"rgba(100,100,100,0.25)",
          radius: radius,
          strokeWidth: drawWidth
        });
        textObject = new fabric.Text("半径："+Math.round(radius)+"px\n"+
          "面积："+Math.round(Math.PI*radius*radius)+"px"+"\n"+
          "周长："+Math.round(2*Math.PI*radius)+"px"+"\n",{
          // width:20,
          // height:20,
          fontSize:24,
          top:middle.y,
          left:middle.x,
          fontSize:24,
          opacity:0.6,
          textBackgroundColor:"#fefefe",          
          });
        break;
      case "rectangle": //长方形
        var path =
          "M " +
          mouseFrom.x/can_zoom +
          " " +
          mouseFrom.y/can_zoom +
          " L " +
          mouseTo.x/can_zoom +
          " " +
          mouseFrom.y/can_zoom +
          " L " +
          mouseTo.x/can_zoom +
          " " +
          mouseTo.y/can_zoom +
          " L " +
          mouseFrom.x/can_zoom +
          " " +
          mouseTo.y/can_zoom +
          " L " +
          mouseFrom.x/can_zoom +
          " " +
          mouseFrom.y/can_zoom +
          " z";
        canvasObject = new fabric.Path(path, {
          left: left,
          top: top,
          stroke: color,
          lockMovementX:true,
          lockMovementY:true,
          lockScalingX:true,
          lockScalingY:true,
          lockRolation:true,
          selectionBackgroundColor:"rgba(100,100,100,0.25)",
          strokeWidth: drawWidth,
          fill: "rgba(255, 255, 255, 0)"
        });
        textObject = new fabric.Text("宽度："+rectWidth+"px\n"+
          "高度："+rectHeight+"px\n"+
          "面积："+squreValue+"px"+"\n"+
          "周长："+arcValue+"px"+"\n",{
          width:20,
          height:20,
          top:middle.y,
          left:middle.x,
          fontSize:24,
          opacity:0.6,
          textBackgroundColor:"#fefefe",
          });
        break;
      case "text":
        textbox = new fabric.Textbox("", {
          left: mouseFrom.x - 60,
          top: mouseFrom.y - 20,
          width: 150,
          fontSize: 18,
          borderColor: "#2c2c2c",
          fill: color,
          hasControls: false
        });
        overlay.fabricCanvas().add(textbox);
        textbox.enterEditing();
        textbox.hiddenTextarea.focus();
        break;
      case "clear":
        break;
      default:
        break;
    }
    if (canvasObject || textObject) {
      var group = new fabric.Group([canvasObject, textObject], {
         selectionBackgroundColor:"rgba(100,100,100,0.25)",
      });      
      overlay.fabricCanvas().add(group);
      groupObject = group;
    }
  }

  //绘制箭头方法
  function drawArrow(fromX, fromY, toX, toY, theta, headlen) {
    theta = typeof theta != "undefined" ? theta : 30;
    headlen = typeof theta != "undefined" ? headlen : 10;
    // 计算各角度和对应的P2,P3坐标
    var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI,
      angle1 = (angle + theta) * Math.PI / 180,
      angle2 = (angle - theta) * Math.PI / 180,
      topX = headlen * Math.cos(angle1),
      topY = headlen * Math.sin(angle1),
      botX = headlen * Math.cos(angle2),
      botY = headlen * Math.sin(angle2);
    var arrowX = fromX - topX,
      arrowY = fromY - topY;
    var path = " M " + fromX + " " + fromY;
    path += " L " + toX + " " + toY;
    arrowX = toX + topX;
    arrowY = toY + topY;
    path += " M " + arrowX + " " + arrowY;
    path += " L " + toX + " " + toY;
    arrowX = toX + botX;
    arrowY = toY + botY;
    path += " L " + arrowX + " " + arrowY;
    return path;
  }

  //获取画板对象的下标
  function getCanvasObjectIndex() {
    return canvasObjectIndex++;
  }
})();
