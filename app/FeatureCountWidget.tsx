import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import Widget from "esri/widgets/Widget";

import { renderable, tsx } from "esri/widgets/support/widget";
import View from "esri/views/View";
import SceneView from "esri/views/SceneView";
import MapView from "esri/views/MapView";
import LayerView from "esri/views/layers/LayerView";
import FeatureLayerView from "esri/views/layers/FeatureLayerView";
import { Extent } from "esri/geometry";

const CSS = {
    base: "esri-widget",
    specific: "feature-count-widget",
    emphasis: "feature-count-widget--emphasis"
};

@subclass("esri.widgets.FeatureCountWidget")
class FeatureCountWidget extends declared(Widget) {
    constructor(view: View) {
        super();
        this.view = view;

        if (this.view.type == "2d") {
            let mapView = this.view as MapView;
            this.countFeatures(mapView.extent);
            mapView.watch("extent", this.countFeatures);
        }
        else if (this.view.type == "3d") {
            let sceneView = this.view as SceneView;
            this.countFeatures(sceneView.extent);
            sceneView.watch("extent", this.countFeatures);
        }
    }

    @property()
    @renderable()
    view: View;

    @property()
    @renderable()
    emphasized: boolean = false;

    @property()
    @renderable()
    featureCount: number = 0;


    countFeatures = async (extent: Extent) => {
        const filtered = this.view.allLayerViews.filter((layerView: LayerView) => layerView.declaredClass.indexOf("FeatureLayerView") > -1);
        if (filtered.length > 0) {
            const flv = filtered.getItemAt(0) as FeatureLayerView;
            const flvQuery = flv.createQuery();
            flvQuery.geometry = extent;
            const flvResult = await flv.queryFeatureCount(flvQuery);
            this.featureCount = flvResult;
        };
    }

    // Public method
    render() {
        const classes = {
            [CSS.emphasis]: this.emphasized
        };

        return (
            <div class={this.classes(CSS.base, CSS.specific, classes)}>
                {this.featureCount}
            </div>
        );
    }

};

export = FeatureCountWidget;