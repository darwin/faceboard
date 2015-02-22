(ns faceboard.utils)

(defn model->json [model]
  (.stringify js/JSON (clj->js model) nil 2))

(defn json->model [json]
  (let [parsed-obj (.parse js/JSON json)]
    (js->clj parsed-obj :keywordize-keys true)))