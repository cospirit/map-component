<template>
    <div
        :id="sidebarPaneId"
        :tab-title="title"
        :tab-icon="icon"
        :tab-disabled="disabled"
        class="leaflet-sidebar-pane"
    >
        <slot />
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";

@Component
export default class SidebarPane extends Vue {
    @Prop(String) protected paneId!: string;
    @Prop(String) protected title!: string;
    @Prop(String) protected icon!: string;
    @Prop({type: Boolean, default: false}) protected disabled!: boolean;

    protected get sidebarPaneId() {
        return `sidebar-pane-${this.paneId}`;
    }
}
</script>
