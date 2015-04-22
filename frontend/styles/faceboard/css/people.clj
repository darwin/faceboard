(ns faceboard.css.people
  (:use [faceboard.lib.constants])
  (:use [faceboard.shared.anims])
  (:require [faceboard.lib.helpers :refer [>> mv px ms]]))

(def styles
  [(>> embedded
     (>> people-board
       (>> people-scaffold
         [:padding-right (px 0)])))
   (>> people-board
     [:padding (px 0)]
     (>> desktop
       [:padding (px 0)
        :perspective (px 2000)
        :perspective-origin "50% 50%"]
       (>> edit-background
         [:opacity 0.5
          :background-color "#000"
          :position :fixed
          :top (px 0)
          ;:bottom (px 0) this does not work for small boards
          :min-height "10000px"                             ; HACK IT
          :left (px 0)
          :right (px 0)
          :z-index 11])
       (>> &.editing
         (>> person
           (>> right-part
             [:overflow :visible]))))                       ; for gizmos
     (>> people-scaffold
       [:padding-right (px 280)                             ; leave room for expanded cards
        :visibility :hidden])
     (>> separator
       [:margin-top (px 100)])
     (>> people-layout
       (>> person-card
         [:position :absolute
          :z-index 10
          :transform-style :preserve-3d
          :transition (str "transform 1s " ease-in-out-cubic)]
         (>> person-card-zoom
           [:transition (str "transform 0.3s " ease-out-back)])
         (>> &.filtered
           [:opacity 0.5
            :-webkit-filter "grayscale(1)"
            :z-index 0]
           (>> polaroid-frame
             [:opacity 1]))
         (>> &.expandable
           [:cursor :pointer])
         ; zoom-in animation
         (>> &.extended
           [:z-index 15])
         (>> &.top-z
           [:z-index 20])
         ; expanding animation
         (>> &.expanding
           (>> [person right-part]
             [:transition (str "all " (ms person-expanding-sliding-delay) " " ease-in-quit)
              :overflow :hidden])
           (>> polaroid-frame
             [:transition (str "transform " (ms person-expanding-rotation-delay) " " ease-out-quit)]))
         (>> &.expanding-phase0
           (>> [person right-part]
             [:width "0px"
              :visibility :hidden]))
         (>> &.expanding-phase1
           (>> [person right-part]
             [:width "300px"]))
         ; shrinking animation
         (>> &.shrinking
           (>> [person right-part]
             [:transition (str "all " (ms person-shrinking-sliding-delay) " " ease-in-quit)
              :overflow :hidden])
           (>> polaroid-frame
             [:transition (str "transform " (ms person-shrinking-rotation-delay) " " ease-out-quit)]))
         (>> &.shrinking-phase0
           (>> [person right-part]
             [:width (px 300)]))
         (>> &.shrinking-phase1
           (>> [person right-part]
             [:width (px 0)]))
         (>> &.shrinking-phase2
           (>> [person right-part]
             [:visibility :hidden]))))
     (>> people-desk
       [:background-color people-desk-background-color])
     (>> people-filters
       [:font-size (px 12)
        :position :absolute
        :right (px 0)
        :width (px 260)
        :height "100%"
        :padding (px 10) (px 20)]
       (>> filter-section
         [:margin-bottom (px 0)]
         (>> filter-section-label
           [:cursor :pointer
            :font-weight :bold
            :color "#999"]
           (>> &.expanded
             (>> filter-indicator
               [:position :relative
                :top (px 2)
                :float :right]))
           (>> caret
             [:margin-right (px 6)
              :font-size (px 16)
              :font-weight :bold
              :position :relative
              :top (px 1)])
           (>> &.active-filter
             (>> filter-indicator
               (>> fa-filter
                 [:color filter-item-background-selected-color])))
           (>> filter-indicator
             [:display :inline-block]
             (>> fa-filter
               [:color "#ccc"])
             (>> filter-clear
               [:color filter-item-background-selected-color
                :font-weight :normal]
               (>> &:hover
                 [:text-decoration :underline]))))
         (>> filter-section-body
           [:margin-left (px 14)
            :border-top "2px solid transparent"
            :padding-left (px 2)
            :transition "height 1s ease-in-out"
            :height 0
            :overflow :hidden]
           (>> &.expanded
             [:height :auto
              :padding-bottom (px 20)
              :padding-top (px 6)
              :border-top "2px solid #ccc"])))
       (>> groups-filter-item
         [:float :left
          :padding (px 1 4)
          :background-color filter-item-background-normal-color
          :color people-desk-background-color
          :margin-bottom (px 2)
          :margin-right (px 2)
          :border-radius (px 2)
          :cursor :pointer]
         (>> &.empty
           [:opacity empty-filter-opacity])
         (>> &.selected
           [:background-color filter-item-background-selected-color])
         (>> &:hover
           [:background-color filter-item-background-hovered-color]))
       (>> countries-filter-item
         [:color people-desk-background-color
          :margin-bottom (px 2)
          :margin-right (px 2)
          :border-radius (px 2)
          :cursor :pointer
          :padding (px 1 3)
          :height (px 16)
          :float :left]
         (>> &.empty
           [:opacity empty-filter-opacity])
         (>> &.selected
           [:background-color filter-item-background-selected-color])
         (>> &:hover
           [:background-color filter-item-background-hovered-color]))
       (>> tags-filter-item
         [:float :left
          :padding (px 1 4)
          :background-color filter-item-background-normal-color
          :color people-desk-background-color
          :margin-bottom (px 2)
          :margin-right (px 2)
          :border-radius (px 2)
          :cursor :pointer]
         (>> &.empty
           [:opacity empty-filter-opacity])
         (>> &.selected
           [:background-color filter-item-background-selected-color])
         (>> &:hover
           [:background-color filter-item-background-hovered-color]))
       (>> socials-filter-item
         [:float :left
          :font-size (px 20)
          :line-height (px 16)
          :margin-bottom (px 4)
          :margin-right (px 4)
          :color filter-item-background-normal-color
          :border-radius (px 4)
          :cursor :pointer]
         (>> &.empty
           [:opacity empty-filter-opacity])
         (>> &.selected
           [:color filter-item-background-selected-color])
         (>> &:hover
           [:color filter-item-background-hovered-color])))
     (>> person-card
       [:position :relative
        :float :left
        :margin (px 20 20)
        :opacity 1]
       (>> has-placeholder
         [:border "1px dashed #ddd !important"
          :border-radius (px 2)]
         (>> [> *]
           [:opacity 0.3])))
     (>> polaroid-frame
       [:transform-origin "70px 80px"
        :background-color "#f6f6f6"
        :border "1px solid #eee"
        :padding-left (px 8)
        :padding-right (px 8)
        :padding-bottom (px 4)
        :padding-top (px 0)
        :box-shadow "0px 0px 10px -1px rgba(0,0,0,0.2)"
        :transition "all .3s ease-in-out"
        :opacity 0.8
        :white-space :nowrap]
       (>> &:hover
         [:background-color "#fafafa"
          :opacity 1
          :box-shadow "0px 0px 20px -1px rgba(0,0,0,0.2)"])
       (>> photo
         [:margin-bottom (px 6)
          :width (px 126)
          :height (px 120)
          :overflow :hidden
          :border-radius (px 4)
          :border "2px solid #eee"
          :background-color "white"
          :box-shadow "inset 0px 0px 20px 0px rgba(0,0,0,0.2)"]
         (>> &.no-frame
           [:box-shadow :none
            :background-color "transparent"
            :border "2px solid transparent"])
         (>> :img
           [:max-width (px 126)]))
       (>> photo-section
         [:position :relative])
       (>> name-section
         [:position :relative]
         (>> flag
           [:margin-left (px 6)
            :height "14px !important"
            :position :relative
            :top (px 1)])
         (>> name
           [:font-size (px 18)
            :text-align :center
            :font-weight :bold
            :white-space :nowrap
            :overflow :hidden])))
     (>> person-extended-wrapper
       [:position :absolute])
     (>> [extended polaroid-frame]
       [:background-color "#fafafa"
        :transform "rotate(0deg) !important"
        :opacity 1
        :box-shadow "0px 0px 20px -1px rgba(0,0,0,0.2)"])
     (>> person
       (>> person-buttons
         [:position :relative])
       (>> person-edit-button
         [:position :absolute
          :top (px -6)
          :left (px 292)                                    ; position it from left to play well with shrinking/expanding animation
          :padding (px 0 4)
          :z-index 10
          :color "#999"]
         (>> &:hover
           [:color signature-color]))
       (>> left-part
         [:padding-top (px 10)
          :display :inline-block
          :vertical-align :top])
       (>> right-part
         [:padding-top (px 10)
          :display :inline-block
          :overflow :hidden
          :visibility :visible]
         (>> card-controls
           [:position :absolute]
           (>> &.bottom-right
             [:bottom (px -22)
              :right (px -1)])
           (>> &.top-left
             [:top (px -22)
              :left (px -11)])
           (>> &.top-right
             [:top (px -22)
              :right (px -1)]))
         (>> card-control
           [:background-color "#f6f6f6"
            :cursor :pointer
            :font-weight :bold
            :font-family gizmo-font
            :font-size (px 10)
            :display :inline-block
            :padding (px 2 6)
            :margin-left (px 10)]
           (>> &:hover
             [:color signature-color])
           (>> :i
             [:margin-right (px 4)])
           (>> &.done-control
             [:border-top "4px solid #66ff66"])
           (>> &.delete-control &.clear-control
             [:border-top "4px solid #ff6666"])
           (>> &.duplicate-control
             [:border-top (str "4px solid " gizmo-border-color)])
           (>> &.json-control
             [:border-bottom "4px solid #999"]))))
     (>> person-extended-info
       [:min-width (px 300)
        :vertical-align :top
        :min-height (px 150)
        :margin-left (px 10)
        :line-height (px 16)
        :font-size (px 12)]
       (>> :a
         [:color signature-color
          :text-decoration :none]
         (>> &:hover
           [:text-decoration :underline]))
       (>> extended-info-section
         [:position :relative
          :border "1px solid transparent"                   ; to be consistent with has-placeholder
          :clear :both
          :margin-bottom (px 10)
          :padding (px 3)
          :max-width (px 293)                               ; (- 300 (* 2 3)) account for 3px left/right padding
          :padding-top (px 6)]
         (>> &.has-placeholder
           (>> info-title
             [:opacity 1]))
         (>> &:last-child
           [:margin-bottom (px 0)])
         (>> &.about
           [:white-space :normal])
         (>> &.tags
           [:color social-badge-text-color
            :line-height (px 18)
            :white-space :normal])
         (>> info-title
           [:color "#bbb"
            :line-height (px 10)
            :margin-bottom (px 6)
            :border-bottom "2px solid #eee"]))
       (>> social-item
         [:float :left
          :margin-bottom (px 3)
          :margin-right (px 3)
          :white-space :nowrap
          :border-radius (px 2)]
         (>> &:hover
           (>> icon
             [:color social-badge-background-hovered-color]))
         (>> content
           [:display :none])
         (>> icon
           [:font-size (px 20)
            :color social-badge-background-color])
         (>> &.link
           [:clear :both
            :margin (px 0)]
           (>> content
             [:display :inline])
           (>> icon
             [:display :none
              :font-size (px 14)])))
       (>> tags-item
         [:float :left
          :margin-bottom (px 3)
          :padding (px 1 6 0 6)
          :margin-right (px 3)
          :white-space :nowrap
          :border-radius (px 2)
          :background-color social-badge-background-color])))])