import EsriMap from "esri/Map";
import MapView from "esri/views/MapView";
import FeatureLayer from "esri/layers/FeatureLayer";
import LayerList from "esri/widgets/LayerList";
import Compass from "esri/widgets/Compass";
import ScaleRangeSlider from "esri/widgets/ScaleRangeSlider";
import Search from "esri/widgets/Search";
import SceneView from "esri/views/SceneView";
import View from "esri/views/View";
import { Point } from "esri/geometry";
import FeatureCountWidget from "./FeatureCountWidget";

class LearnJsapi4App {

  private map: EsriMap;
  mapView: MapView;
  sceneView: SceneView;
  weinLayer: FeatureLayer;
  weinQuery: __esri.Query;

  constructor() {
    this.initializeMap();
    this.addWeinLayer();

    this.mapView = this.viewFactory(MapView, "mapDiv");
    this.sceneView = this.viewFactory(SceneView, "sceneDiv");
    let firsttime = true;
    this.sceneView.watch("stationary", (s: boolean) => {
      if (s && firsttime) {
        firsttime = false;
        this.sceneView.watch("center", (c: Point) => {
          this.mapView.center = c;
        });
      }
    });
  }

  private initializeMap() {
    this.map = new EsriMap({
      basemap: "gray-vector"
    });
  }

  private viewFactory<V extends View>(view: new (parameters: object) => V, containerDiv: string): V {
    let initView = new view({
      map: this.map,
      container: containerDiv,
      center: [-118.244, 34.052],
      zoom: 3
    });

    this.addWidgets(initView);

    initView.when(() => {
      this.weinLayer.queryExtent(this.weinQuery).then((result: any) => {
        initView.goTo(result.extent, {
          animate: true,
          duration: 10000,
          easing: "ease-out"
        });
      });
    });
    return initView;
  }

  private addWeinLayer() {
    this.weinLayer = new FeatureLayer({
      url: "http://services.arcgis.com/OLiydejKCZTGhvWg/arcgis/rest/services/WeinanbauGebiete/FeatureServer/0"
    });
    this.map.add(this.weinLayer);
    this.weinQuery = this.weinLayer.createQuery();
    this.weinQuery.where = "1=1";
    this.weinQuery.outFields = ["*"];
  }

  private addWidgets(view: View) {
    var layerList = new LayerList({
      view: view
    });
    view.ui.add(layerList, {
      position: "bottom-right",
      index: 0
    });

    if (view.type == "2d") {
      var compass = new Compass({
        view: view
      });
      view.ui.add(compass, "top-left");
    }

    const scaleRangeSlider = new ScaleRangeSlider({
      view: view,
      layer: this.weinLayer,
      region: "DE"
    });
    view.ui.add(scaleRangeSlider, "bottom-left");
    scaleRangeSlider.watch(["minScale", "maxScale"], function (value, oldValue, name) {
      this.weinLayer[name] = value;
    });

    var searchWidget = new Search({
      view: view
    });
    view.ui.add(searchWidget, {
      position: "top-right",
      index: 0
    });

    var featureCountWidget = new FeatureCountWidget({
      view: view
    });
    view.ui.add(featureCountWidget, {
      position: "top-right",
      index: 0
    });
  }

}

let app = new LearnJsapi4App();