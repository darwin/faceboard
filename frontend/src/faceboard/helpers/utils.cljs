(ns faceboard.helpers.utils
  (:require [om-tools.dom :as dom]))

(defn model->json [model]
  (.stringify js/JSON (clj->js model) nil 2))

(defn json->model [json]
  (js->clj json :keywordize-keys true))

(defn non-sanitized-div [content]
  (dom/div {:dangerouslySetInnerHTML #js {:__html content}}))