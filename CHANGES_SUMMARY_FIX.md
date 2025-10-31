# Fix: OpenAI API Key Propagation

## ✅ Что исправлено

**Проблема:** Frontend передавал API ключ через header, но backend его не читал.

**Решение:** Добавлена поддержка передачи API ключа через body + header с fallback на env.

---

## 📊 Статистика изменений

```
+++ 58 строк
--- 12 строк
```

✅ **Больше добавлено чем удалено** (требование выполнено)

---

## 📝 Изменённые файлы

### 1. `netlify/functions/analyze.js`
- Добавлено чтение API ключа из `body.apiKey` и header `X-OpenAI-API-Key`
- Приоритет: body → header → env
- Улучшенное логирование источника ключа
- Лучшая обработка ошибки (statusCode 400 вместо 500)

### 2. `netlify/functions/screenshot.js`
- Добавлено логирование API ключа для отладки

### 3. `index.html`
- API ключ теперь передаётся и через body, и через header

### 4. `test.sh` (новый)
- Скрипт для тестирования после деплоя

### 5. `PR_DESCRIPTION.md` (новый)
- Детальное описание изменений для PR

---

## 🔍 Что НЕ изменено

- ❌ Существующий код НЕ удалён
- ❌ Архитектура НЕ изменена
- ❌ Зависимости НЕ обновлены
- ❌ CI/CD НЕ изменён

---

## 🧪 Тестирование

### Синтаксис
```bash
node -c netlify/functions/analyze.js    # ✅ OK
node -c netlify/functions/screenshot.js # ✅ OK
```

### После деплоя
```bash
export TEST_API_KEY="sk-proj-..."
bash test.sh
```

---

## 📋 Acceptance Criteria

- [x] +++ больше чем --- ✅
- [x] Существующий код НЕ удалён ✅
- [x] Только исправлена проблема с ключом ✅
- [x] Добавлены логи ✅
- [x] Создан test.sh ✅
- [ ] Протестировано на nlabteam.com (после деплоя)

---

## 🚀 Деплой

После merge изменения будут автоматически задеплоены на Netlify.

Проверить работу:
1. Открыть https://nlabteam.com
2. Нажать "🔌 Подключить API OpenAI"
3. Ввести API ключ
4. Ввести URL и нажать "Найти"
5. ✅ Должен работать без ошибки

---

## 🔑 Как работает передача ключа

```
Frontend (localStorage)
    ↓
    ├→ headers['X-OpenAI-API-Key'] = apiKey
    └→ body.apiKey = apiKey
    ↓
Backend (analyze.js)
    ↓
    ├→ Проверяет body.apiKey
    ├→ Проверяет header['x-openai-api-key']
    └→ Проверяет process.env.OPENAI_API_KEY
    ↓
OpenAI API
```

---

## 📌 Примечания

- API ключ передаётся через HTTPS (безопасно)
- Ключ не логируется полностью (только префикс)
- Обратная совместимость: env ключ всё ещё работает
- Локальная разработка: можно использовать .env файл
