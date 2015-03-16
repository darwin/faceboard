(ns faceboard.helpers.utils)

(defn model->json [model]
  (.stringify js/JSON (clj->js model) nil 2))

(defn json->model [json]
  (js->clj json :keywordize-keys true))