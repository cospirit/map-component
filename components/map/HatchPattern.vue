<template>
    <svg width="0" height="0">
        <defs>
            <pattern id="hatchPattern" width="4" height="4" patternUnits="userSpaceOnUse">
                <rect width="4" height="4" :fill="color" opacity="0.1" /> <!-- Fond bleu -->
                <path d="M0,4 l4,-4 M-1,1 l2,-2 M3,5 l2,-2" style="stroke:white; stroke-width:1; fill:none;" />
            </pattern>
            <pattern id="dotPattern" width="4" height="4" patternUnits="userSpaceOnUse">
                <rect width="8" height="8" :fill="color" /> <!-- Fond dynamique -->
                <circle cx="4" cy="4" r="2" style="stroke:none; fill:white;" /> <!-- Cercle plus grand -->
            </pattern>
        </defs>
    </svg>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import {Prop, Watch} from "vue-property-decorator";

@Component
export default class HatchPattern extends Vue {
    @Prop({ type: String, default: "blue" }) protected color!: string;
}
</script>