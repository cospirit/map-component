<template>
    <div :id="id" class="leaflet-sidebar collapsed" style="height: 98%">
        <div class="leaflet-sidebar-tabs" >
            <ul role="tablist">
                <li
                    v-for="(sidebarTab) in sidebarTabs"
                    :title="sidebarTab.title"
                    :class="{ disabled: sidebarTab.disabled, active: isActivePane(sidebarTab.target) }"
                    :key="sidebarTab.target"
                >
                    <a :href="getSidebarTabTarget(sidebarTab)" :name="sidebarTab.target" role="tab">
                        <i :class="sidebarTab.icon" />
                    </a>
                </li>
            </ul>
        </div>
        <div ref="sidebarContent" class="leaflet-sidebar-content">
            <slot />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import _ from "lodash";
import L, { LeafletEvent } from "leaflet";

interface SidebarTab {
    target: string;
    title: string;
    icon: string;
    disabled: boolean;
}

interface SidebarContentEvent extends LeafletEvent {
    id: string;
}

@Component
export default class Sidebar extends Vue {
    protected sidebar: L.Control.Sidebar | null = null;
    protected sidebarTabs: SidebarTab[] = [];
    @Prop(String) protected id!: string;
    @Prop({type: String, default: ""}) protected activePane!: string;

    protected mounted() {
        this.sidebar = L.control.sidebar({
            autopan: true,
            closeButton: false,
            container: this.id,
            position: "left",
        });
        this.generateInitialSidebarTabs();

        const vm = this;
        this.$nextTick(() => {
            this.sidebar!.on({
                content(event: L.LeafletEvent) {
                    const regex1 = /^sidebar-pane-([\w-]+)$/;
                    const paneId = _.get(regex1.exec((event as SidebarContentEvent).id), "1", "");
                    vm.$emit("change", paneId);
                },
                closing() {
                    vm.$emit("change", "");
                },
            });
            this.$emit("mounted", this.sidebar);
            this.openPane(this.activePane);
        });
    }

    @Watch("activePane") protected openPane(paneId: string) {
        if (!this.sidebar) {
            return;
        }

        if ("" === paneId) {
            this.sidebar.close();
            return;
        }

        this.sidebar.enablePanel(this.activeFullPaneId);
        this.sidebar.open(this.activeFullPaneId);
    }

    protected get activeFullPaneId(): string {
        return `sidebar-pane-${this.activePane}`;
    }

    protected generateInitialSidebarTabs() {
        this.sidebarTabs = [];
        const sidebarContent = this.$refs.sidebarContent as HTMLElement;

        if (!sidebarContent) {
            return;
        }

        const paneElements = sidebarContent.querySelectorAll(".leaflet-sidebar-pane");
        paneElements.forEach((pane: Element) => {
            const id = pane.getAttribute("id");
            const title = pane.getAttribute("tab-title");
            const icon = pane.getAttribute("tab-icon");

            if (null === id || null === title || null === icon) {
                return;
            }

            const disabled = pane.getAttribute("tab-disabled") ? true : false;
            this.sidebarTabs.push({
                target: id,
                title,
                icon,
                disabled
            });
        });

        const vm = this;
        const observer = new MutationObserver((mutations: MutationRecord[]) => {
            _.forEach(mutations, (mutation: MutationRecord) => {
                if ("attributes" === mutation.type && "tab-disabled" === mutation.attributeName) {
                    const targetedPane = mutation.target as Element;
                    _.forEach(vm.sidebarTabs, (tab: SidebarTab) => {
                        if (tab.target === targetedPane.id) {
                            tab.disabled = targetedPane.getAttribute("tab-disabled") ? true : false;
                        }
                    });
                }
            });
        });

        _.forEach(paneElements, (element) => {
            observer.observe(element, {
                attributes: true, // configure it to listen to attribute changes
            });
        });
    }

    protected getSidebarTabTarget(sidebarTab: SidebarTab) {
        return `#${sidebarTab.target}`;
    }

    protected isActivePane(paneId: string) {
        return this.activeFullPaneId === paneId;
    }
}
</script>
