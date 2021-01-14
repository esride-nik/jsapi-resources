import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import Widget from "esri/widgets/Widget";
import { renderable, tsx } from "esri/widgets/support/widget";
import View from "esri/views/View";
import MapView from "esri/views/MapView";
import SceneView from "esri/views/SceneView";
import FeatureLayer from "esri/layers/FeatureLayer";
import FeatureLayerView from "esri/views/layers/FeatureLayerView";
import Graphic from "esri/Graphic";
import geometryEngine from "esri/geometry/geometryEngine";

const CSS = {
    base: "esri-hello-world",
    emphasis: "esri-hello-world--emphasis",
    button: "esri-sketch__button",
    selectedButton: "esri-sketch__button--selected",
    cursorIcon: "esri-icon-cursor",
    unionIcon: "esri-icon-pie-chart",
    clearIcon: "esri-icon-trash",
    noFlex: "no-flex",
    active: "active"
};

@subclass("esri.widgets.GeometryWidget")
class GeometryWidget extends declared(Widget) {
    @renderable()
    @property()
    view: View;
    selectionEnabled: boolean = false;
    selectionTargetLayer: FeatureLayer;
    layerView: FeatureLayerView;
    highlightClickHandler: IHandle;
    highlightedFeatures: Graphic[] = [];
    highlightHandles: __esri.Handle[] = [];
    editLayer: FeatureLayer;

    constructor(view: View) {
        super();
        this.view = view;
    }

    public setSelectionTarget(layer: FeatureLayer) {
        this.selectionTargetLayer = layer;
    }

    public setEditLayer(layer: FeatureLayer) {
        this.editLayer = layer;
    }

    public setLayerView(layerView: FeatureLayerView) {
        this.layerView = layerView;
    }

    protected toggleSelectMode() {
        this.selectionEnabled = !this.selectionEnabled;
        if (this.selectionEnabled) {
            this.highlightClickHandler = this.view.on("click", (event: any) => {
                if (this.selectionTargetLayer) {
                    var query = this.selectionTargetLayer.createQuery();
                    query.geometry = event.mapPoint;
                    query.distance = 100;
                    query.units = "meters";
                    query.spatialRelationship = "intersects";  // this is the default
                    query.returnGeometry = true;
                    query.outFields = ["*"];
                    this.selectionTargetLayer.queryFeatures(query)
                        .then((response) => {
                            this.highlightHandles.push(this.layerView.highlight(response.features));
                            this.highlightedFeatures.push(...response.features);
                        });
                }
                else {
                    console.error("GeometryWidget: No target FeatureLayer set.");

                }
            });
        } else {
            this.highlightClickHandler.remove();
        }
    }

    protected unifySelectedFeatures() {
        let geometries = this.highlightedFeatures.map((feature: Graphic) => {
            return feature.geometry;
        });

        var union = geometryEngine.union(geometries);

        if (this.editLayer) {
            this.editLayer.applyEdits({
                addFeatures: [new Graphic({
                    geometry: union
                })]
            });
        }
        else {
            console.warn("GeometryWidget: No GraphicsLayer set to display unified geometry.", union);
        }
    }

    protected clearSelectedFeatures() {
        this.highlightedFeatures = [];
        this.highlightHandles.map((handle: __esri.Handle) => { handle.remove() });
    }

    protected renderSelectButton(): any {
        const title = "Select";
        let classes = [CSS.button, CSS.cursorIcon, CSS.noFlex];
        if (this.selectionEnabled) {
            classes.push(CSS.active);
        }

        return (
            <button
                bind={this}
                class={this.classes(classes)}
                onclick={this.toggleSelectMode}
                title={title}
            />
        );
    }

    protected renderUnionButton(): any {
        const title = "Union";
        let classes = [CSS.button, CSS.unionIcon, CSS.noFlex];

        return (
            <button
                bind={this}
                class={this.classes(classes)}
                onclick={this.unifySelectedFeatures}
                title={title}
            />
        );
    }

    protected renderClearButton(): any {
        const title = "Clear";
        let classes = [CSS.button, CSS.clearIcon, CSS.noFlex];

        return (
            <button
                bind={this}
                class={this.classes(classes)}
                onclick={this.clearSelectedFeatures}
                title={title}
            />
        );
    }

    render() {
        let view = this.view.type === "2d" ? this.view as MapView : this.view as SceneView;

        return (
            <div class="bwPopup">
                {this.renderSelectButton()}
                {this.renderUnionButton()}
                {this.renderClearButton()}
            </div>
        )
    }
}



export default GeometryWidget;