(ns faceboard.lib.constants
  (:require [garden.units :as units]
            [faceboard.lib.helpers :refer [>> mv px]]))

(def header-height (px 22))

(def base-font "'Lucida Sans Unicode', 'Lucida Grande', Verdana, sans-serif")
(def board-font "'Kalam', cursive")
(def editor-font "monospace")
(def signature-font "'Exo', sans-serif")

(def signature-color "#3a5795")
(def error-color "#e00000")
(def loading-color "#666")
(def selected-tab-color "#eee")

(def menu-button-background-color "#000")
(def pressed-menu-button-background-color "#000")
(def menu-button-text-color "white")
(def pressed-menu-button-text-color "yellow")

(def social-badge-background-color "#aaa")
(def social-badge-text-color "#fff")
(def social-badge-background-hovered-color signature-color)

(def filter-item-background-hovered-color "#fff64c")
(def filter-item-background-selected-color "#fffbb3")