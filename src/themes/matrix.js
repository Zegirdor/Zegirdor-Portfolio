import { definePreset } from "@primeuix/themes"
import Aura from "@primeuix/themes/aura"

const Matrix = definePreset(Aura, {
    semantic: {
        primary: {
            color: "#1EFF5A",
            contrastColor: "#040805"
        },
        content: {
            color: "#00FF40",
            background: "#040805"
        },
        text: {
            color: "#00FF40"
        }
    }
})

export default Matrix