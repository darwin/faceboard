(ns editor.helpers.utils)

(defn model->json [model]
  (.stringify js/JSON (clj->js model) nil 2))

(defn json->model [json]
  (let [obj (.parse js/JSON json)]
    (js->clj obj :keywordize-keys true)))