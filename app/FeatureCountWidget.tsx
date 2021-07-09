import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import Widget from "esri/widgets/Widget";

import { renderable, tsx } from "esri/widgets/support/widget";
import View from "esri/views/View";
import SceneView from "esri/views/SceneView";
import MapView from "esri/views/MapView";
import LayerView from "esri/views/layers/LayerView";
import FeatureLayerView from "esri/views/layers/FeatureLayerView";

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
    }

    @property()
    @renderable()
    view: View;

    @property()
    @renderable()
    emphasized: boolean = false;



    layerEvaluation() {
        const filtered = this.view.allLayerViews.filter((layerView: LayerView) => layerView.declaredClass.indexOf("FeatureLayerView") > -1);
        if (filtered.length > 0) {
            const flv = filtered.getItemAt(0) as FeatureLayerView;
            // flv.queryExtent().then((flvResult: any) => console.log(flv.layer.id, flvResult.count));
            flv.queryFeatureCount().then((flvResult: any) => console.log(flvResult));
        };
    }

    // Public method
    render() {
        const classes = {
            [CSS.emphasis]: this.emphasized
        };

        return (
            <div class={this.classes(CSS.base, CSS.specific, classes)}>
                View size {this.view.height}*{this.view.width}<br />
                {this.layerEvaluation()}
            </div>
        );
    }

};

export = FeatureCountWidget;