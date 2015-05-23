(ns faceboard.lib.constants
  (:require [garden.units :as units]
            [faceboard.lib.helpers :refer [>> mv px]]))

(def header-height (px 22))

(def base-font "'Lucida Sans Unicode', 'Lucida Grande', Verdana, sans-serif")
(def board-font "'Kalam', cursive")
(def editor-font "monospace")
(def signature-font "'Exo', sans-serif")
(def gizmo-font "monospace")
(def sticker-font board-font)

(def signature-color "#3a5795")
(def error-color "#e00000")
(def loading-color "#666")
(def selected-tab-color "#eee")

(def menu-button-background-color "#000")
(def pressed-menu-button-background-color "#000")
(def menu-button-text-color "white")
(def pressed-menu-button-text-color "yellow")

(def taglike-background-color "#aaa")
(def taglike-text-color "#fff")
(def taglike-background-hovered-color signature-color)

(def filter-item-background-normal-color "#aaa")
(def filter-item-background-hovered-color "#5077cc")
(def filter-item-background-selected-color signature-color)
(def filter-item-background-deselected-color "#ddd")

(def people-desk-background-color selected-tab-color)

(def gizmo-border-color signature-color)
(def gizmo-point-color "#999")
(def gizmo-point-hovered-color signature-color)
(def gizmo-point-active-color signature-color)

(def empty-filter-opacity 0.3)
