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
            background: "#040805",
            hoverBackground: "#0B2111",
            borderColor: "#174D26"
        },
        text: {
            color: "#00FF40"
        },
        formField: {
            background: "#040805",
            color: "#00FF40",
            borderColor: "#174D26",
            hoverBorderColor: "#1EFF5A",
            focusBorderColor: "#1EFF5A",
            placeholderColor: "#70C887",
            iconColor: "#1EFF5A"
        },
        overlay: {
            select: {
                background: "#040805",
                color: "#00FF40",
                borderColor: "#174D26"
            },
            popover: {
                background: "#040805",
                color: "#00FF40",
                borderColor: "#174D26"
            }
        },
        list: {
            option: {
                color: "#00FF40",
                focusColor: "#1EFF5A",
                focusBackground: "#0B2111",
                selectedColor: "#1EFF5A",
                selectedBackground: "#12371A",
                selectedFocusColor: "#1EFF5A",
                selectedFocusBackground: "#194B24"
            }
        }
    },
    components: {
        chip: {
            root: {
                background: "#0B2111",
                focusBackground: "#12371A",
                color: "#00FF40"
            }
        },
        button: {
            text: {
                primary: {
                    color: "#1EFF5A",
                    hoverBackground: "#0B2111",
                    activeBackground: "#12371A"
                }
            }
        }
    }
})

export default Matrix