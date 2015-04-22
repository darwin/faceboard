(ns faceboard.views.boards.people.card-controls
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.helpers.utils :refer [swallow]]
            [faceboard.controller :refer [perform!]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defn toggle-editing-handler [e]
  (swallow e)
  (perform! :toggle-editing))

(defn open-editor-handler [person e]
  (swallow e)
  (perform! :open-editor (om/path person) (.-shiftKey e)))

(defn duplicate-card-handler [person e]
  (swallow e)
  (perform! :duplicate-card (om/path person)))

(defn clear-card-handler [person e]
  (swallow e)
  (perform! :clear-card (om/path person)))

(defn delete-card-handler [person e]
  (swallow e)
  (perform! :delete-card (om/path person)))

(defcomponent card-controls-component [data _ _]
  (render [_]
    (let [{:keys [person]} data]
      (dom/div {:class "card-controls-wrapper"}
        (dom/div {:class "card-controls bottom-right"}
          (dom/div {:class    "card-control json-control"
                    :title    "edit underlying json data for the card"
                    :on-click (partial open-editor-handler person)}
            (dom/i {:class "fa fa-cog"})
            "JSON"))
        (dom/div {:class "card-controls top-left"}
          (dom/div {:class    "card-control clear-control"
                    :title    "clear content of the card"
                    :on-click (partial clear-card-handler person)}
            (dom/i {:class "fa fa-eraser"})
            "clear")
          (dom/div {:class    "card-control delete-control"
                    :title    "delete the card"
                    :on-click (partial delete-card-handler person)}
            (dom/i {:class "fa fa-trash"})
            "delete")
          (dom/div {:class    "card-control duplicate-control"
                    :title    "duplicate the card"
                    :on-click (partial duplicate-card-handler person)}
            (dom/i {:class "fa fa-files-o"})
            "duplicate"))
        (dom/div {:class "card-controls top-right"}
          (dom/div {:class    "card-control done-control"
                    :title    "exit editing mode"
                    :on-click toggle-editing-handler}
            (dom/i {:class "fa fa-check-square-o"})
            "done editing"))))))