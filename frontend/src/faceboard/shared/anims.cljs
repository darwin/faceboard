(ns faceboard.shared.anims)

; consult http://easings.net
(def ease-in-out-back "cubic-bezier(0.68, -0.55, 0.265, 1.55)")
(def ease-out-back "cubic-bezier(0.175, 0.885, 0.32, 1.275)")
(def ease-in-quit "cubic-bezier(0.755, 0.05, 0.855, 0.06)")
(def ease-out-quit "cubic-bezier(0.23, 1, 0.32, 1)")
(def ease-in-cubic "cubic-bezier(0.55, 0.055, 0.675, 0.19)")

(def person-expanding-rotation-delay 300)
(def person-expanding-sliding-delay 200)

(def person-shrinking-sliding-delay 200)
(def person-shrinking-rotation-delay 300)

(defn person-expanding [index]
  {:path   [:anims :person :person-expanding index]
   :timing [person-expanding-rotation-delay person-expanding-sliding-delay]})

(defn person-shrinking [index]
  {:path   [:anims :person :person-shrinking index]
   :timing [person-shrinking-sliding-delay person-shrinking-rotation-delay]})