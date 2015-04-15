(ns faceboard.css.people
  (:use [faceboard.lib.constants])
  (:use [faceboard.shared.anims])
  (:require [faceboard.lib.helpers :refer [>> mv px ms]]))

(def styles
  [(>> people-board
     [:padding (px 0)
      :padding-right (px 280)                               ; leave room for expanded cards
      :perspective (px 2000)
      :perspective-origin "50% 50%"]
     (>> people-scaffold
       [:visibility :hidden])
     (>> separator
       [:margin-top (px 100)])
     (>> people-layout
       (>> person-card
         [:position :absolute
          :z-index 10
          :transition (str "transform 1s " ease-in-out-cubic)]
         (>> person-card-zoom
           [:transition (str "transform 0.3s " ease-out-back)])
         (>> &.filtered
           [:opacity 0.3
            :-webkit-filter "grayscale(1)"
            :filter "grayscale(1)"
            :z-index 0])
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
             [:transition (str "all " (ms person-expanding-sliding-delay) " " ease-in-quit)])
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
             [:transition (str "all " (ms person-shrinking-sliding-delay) " " ease-in-quit)])
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
           (>> :span
             [:margin-right (px 4)])
           (>> fa-filter
             [:color "#ccc"])
           (>> &.active-filter
             (>> fa-filter
               [:color filter-item-background-selected-color]))
           (>> filter-clear
             [:color filter-item-background-selected-color
              :font-weight :normal]
             (>> &:hover
               [:text-decoration :underline])))
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
        :opacity 1
        :transform-style :preserve-3d])
     (>> polaroid-frame
       [:transform-origin "70px 80px"
        :background-color "#f6f6f6"
        :border "1px solid #eee"
        :padding (px 10 8)
        :padding-bottom (px 4)
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
          :overflow :hidden]))
     (>> person-extended-wrapper
       [:position :absolute])
     (>> [extended polaroid-frame]
       [:background-color "#fafafa"
        :transform "rotate(0deg) !important"
        :opacity 1
        :box-shadow "0px 0px 20px -1px rgba(0,0,0,0.2)"])
     (>> person
       (>> person-edit-button
         [:position :absolute
          :bottom (px 0)
          :right (px 4)
          :z-index 10
          :color "#999"])
       (>> left-part
         [:display :inline-block
          :vertical-align :top])
       (>> right-part
         [:display :inline-block
          :overflow :hidden
          :visibility :visible]))
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
         [:clear :both
          :margin-bottom (px 20)]
         (>> &:last-child
           [:margin-bottom (px 0)])
         (>> &.about
           [:max-width (px 300)
            :white-space :normal])
         (>> &.tags
           [:color social-badge-text-color
            :max-width (px 300)
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
          :background-color social-badge-background-color]
         (>> &:hover
           [:background-color social-badge-background-hovered-color]))))])