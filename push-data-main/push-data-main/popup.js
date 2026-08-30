let TEMPLATES = {
    "my-project": {
        name: "🚀 我的项目",
        filename: 'data-raw/projects.json',
        fieldOrder: ['title', 'link', 'description', 'category', 'tags'],
        fields: {
            title: { type: 'text', label: '项目名称' },
            link: { type: 'text', label: '项目链接' },
            description: { type: 'textarea', label: '项目描述' },
            tags: {
                type: 'array',
                label: '标签',
                placeholder: '输入标签后按回车或空格',
                default: [],
                required: false
            },
            category: { type: 'text', label: '项目分类' }
        }
    },
    field_types: {
        name: "🔎 模板示例",
        filename: 'data-raw/examples.json',
        fieldOrder: ['text_example', 'textarea_example', 'select_example', 'date_example', 'number_example', 'checkbox_example', 'radio_example', 'array_example'],
        fields: {
            text_example: {
                type: 'text',
                label: '文本输入',
                default: '默认文本',
                required: true
            },
            textarea_example: {
                type: 'textarea',
                label: '多行文本',
                default: '默认多行\n文本内容',
                required: true
            },
            select_example: {
                type: 'select',
                label: '下拉选择',
                options: ['选项A', '选项B', '选项C'],
                default: '选项B',
                required: true
            },
            date_example: {
                type: 'date',
                label: '日期选择',
                required: false
            },
            number_example: {
                type: 'number',
                label: '数字输入',
                required: false
            },
            checkbox_example: {
                type: 'checkbox',
                label: '是否启用',
                default: false,
                required: false
            },
            radio_example: {
                type: 'radio',
                label: '选择性别',
                options: ['男', '女', '其他'],
                default: '男',
                required: true
            },
            array_example: {
                type: 'array',
                label: '标签',
                placeholder: '输入标签后按回车或空格',
                default: [],
                required: true
            }
        }
    }
};

let currentTemplate = null;
let currentLang = 'zh'; // 默认中文

// 支持的语言列表
const SUPPORTED_LANGUAGES = {
    'zh': '简体中文',
    'en': 'English',
    'ja': '日本語',
    'ko': '한국어',
    'fr': 'Français',
    'de': 'Deutsch',
    'es': 'Español'
};

// 获取浏览器语言并设置默认语言
function detectLanguage() {
    const browserLang = navigator.language.toLowerCase();
    // 检查完整的语言代码（例如 zh-CN）
    for (const lang of Object.keys(SUPPORTED_LANGUAGES)) {
        if (browserLang.startsWith(lang)) {
            return lang;
        }
    }
    return 'en'; // 默认返回英语
}

// 获取翻译文本
function t(key, section = null) {
    const keys = key.split('.');
    let value = i18n[currentLang];

    if (section) {
        value = value[section];
    }

    for (const k of keys) {
        value = value[k];
        if (!value) return key;
    }
    return value;
}

// 切换语言
async function toggleLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    await chrome.storage.local.set({ language: currentLang });
    updateLanguage();
}

// 更新页面上的所有文本
function updateLanguage() {
    // 更新 Logo 标题
    const logoSubtitle = document.querySelector('.logo-title small');
    if (logoSubtitle) {
        logoSubtitle.textContent = t('slogan.subtitle');
    }

    // 更新模板选择器标签和选项
    const templateSelect = document.getElementById('templateSelect');
    if (templateSelect) {
        const selectedValue = templateSelect.value;
        templateSelect.innerHTML = `<option value="">${t('selectTemplate')}</option>`;
        Object.entries(TEMPLATES).forEach(([key, template]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = template.name;
            templateSelect.appendChild(option);
        });
        templateSelect.value = selectedValue;

        // 更新模板选择器的标签文本
        const templateLabel = templateSelect.parentElement.querySelector('label');
        if (templateLabel) {
            templateLabel.textContent = t('labels.selectTemplate');
        }
    }

    // 更新仓库选择器标签和选项
    const repoList = document.getElementById('repoList');
    if (repoList) {
        const selectedValue = repoList.value;
        if (!selectedValue) {
            repoList.options[0].textContent = t('selectRepo');
        }
        repoList.value = selectedValue;

        // 更新仓库选择器的标签文本
        const repoLabel = repoList.parentElement.querySelector('label');
        if (repoLabel) {
            repoLabel.textContent = t('labels.selectRepo');
        }
    }

    // 更新提交按钮
    const submitBtn = document.getElementById('submit');
    if (submitBtn) {
        submitBtn.textContent = t('submit');
    }

    // 更新设置按钮
    const settingsBtn = document.getElementById('openSettings');
    if (settingsBtn) {
        settingsBtn.textContent = t('settings');
    }

    // 更新返回按钮
    const backBtn = document.getElementById('backToMain');
    if (backBtn) {
        backBtn.textContent = t('back');
    }

    // 更新Token相关文本
    const noTokenTip = document.getElementById('noTokenTip');
    if (noTokenTip) {
        noTokenTip.innerHTML = `
            <p>${t('welcome.greeting')}</p>
            <p>${t('welcome.tokenTip')}</p>
        `;
    }

    const tokenTitle = document.querySelector('.token-section .settings-item-header h4');
    if (tokenTitle) {
        tokenTitle.textContent = t('token.title');
    }

    const tokenInput = document.getElementById('settingsToken');
    if (tokenInput) {
        tokenInput.placeholder = t('token.placeholder');
    }

    const saveTokenBtn = document.getElementById('settingsSaveToken');
    if (saveTokenBtn) {
        saveTokenBtn.textContent = t('token.save');
    }

    const resetTokenBtn = document.getElementById('settingsResetToken');
    if (resetTokenBtn) {
        resetTokenBtn.textContent = t('token.reset');
    }

    // 更新 Token 提示文本
    const tokenNotice = document.querySelector('.token-notice');
    if (tokenNotice) {
        tokenNotice.textContent = t('token.notice');
    }

    // 更新模板管理标题
    const templateManagementTitle = document.querySelector('.settings-item-header h4');
    if (templateManagementTitle && templateManagementTitle.parentElement.parentElement.querySelector('#templatesEditor')) {
        templateManagementTitle.textContent = t('templates.title');
    }

    // 更新语言设置标题
    const languageTitle = document.querySelector('.language-select-group').previousElementSibling.querySelector('h4');
    if (languageTitle) {
        languageTitle.textContent = t('language.title');
    }

    // 更新设置面板中的文本
    document.getElementById('importTemplates').textContent = t('templates.import');
    document.getElementById('exportTemplates').textContent = t('templates.export');
    document.getElementById('saveTemplates').textContent = t('templates.save');

    // 如果当前有模板表单，重新生成它以更新标签
    if (currentTemplate) {
        generateFormFields(Object.keys(TEMPLATES).find(key => TEMPLATES[key] === currentTemplate));
    }
}

// 检查是否已设置 token
async function checkToken() {
    const result = await chrome.storage.local.get(['github_token']);
    const mainContent = document.getElementById('mainContent');
    const noTokenTip = document.getElementById('noTokenTip');

    if (result.github_token) {
        mainContent.style.display = 'block';
        noTokenTip.style.display = 'none';
        loadRepos();
    } else {
        mainContent.style.display = 'none';
        noTokenTip.style.display = 'block';
    }
}

// 生成表单字段
function generateFormFields(templateName) {
    currentTemplate = TEMPLATES[templateName];
    const formFields = document.getElementById('formFields');
    formFields.innerHTML = '';

    // 检查模板是否存在且具有必要的属性
    if (!currentTemplate || !currentTemplate.fieldOrder || !Array.isArray(currentTemplate.fieldOrder)) {
        //console.error(`Invalid template "${templateName}"`);
        showToast(t('error.invalidTemplate'), 'error');
        return;
    }

    // 添加文件路径提示框
    const pathNotice = document.createElement('div');
    pathNotice.className = 'notice';
    pathNotice.style.marginBottom = '20px';
    pathNotice.style.padding = '16px';
    pathNotice.style.backgroundColor = '#f8f9fa';
    pathNotice.style.border = '1px solid #e1e4e8';
    pathNotice.style.borderRadius = '6px';
    pathNotice.style.fontSize = '13px';
    pathNotice.style.lineHeight = '1.4';
    pathNotice.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';

    // 使用 fieldOrder 来获取有序的字段列表
    const fieldEntries = currentTemplate.fieldOrder.map(fieldName => [
        fieldName,
        currentTemplate.fields[fieldName]
    ]);

    // 获取所有字段名并添加类型信息，保持原始顺序
    const fieldInfo = fieldEntries
        .map(([key, field]) => {
            let typeInfo = field.type;
            if (field.type === 'select') {
                typeInfo += `(${field.options.length})`;
            }
            return `${key}: ${typeInfo}`;
        })
        .join('\n');

    pathNotice.innerHTML = `
        <div style="margin-bottom: 12px;">
            <div style="
                color: #24292e;
                font-weight: 600;
                font-size: 12px;
                margin-bottom: 4px;
                display: flex;
                align-items: center;
                gap: 4px;
            ">
                <span style="opacity: 0.8;">📁</span> ${t('notice.savePath')}
            </div>
            <div style="
                background: #fff;
                padding: 8px 12px;
                border-radius: 4px;
                border: 1px solid #eaecef;
                font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
                font-size: 12px;
                color: #444d56;
                word-break: break-all;
                max-width: 100%;
                overflow-wrap: break-word;
                text-align: left;
            ">${currentTemplate.filename}</div>
        </div>
        <details style="cursor: pointer;">
            <summary style="
                color: #24292e;
                font-weight: 600;
                font-size: 12px;
                margin-bottom: 8px;
                user-select: none;
                display: flex;
                align-items: center;
                gap: 4px;
            ">
                <span style="opacity: 0.8;">🔑</span> ${t('notice.viewFields')}
            </summary>
            <div style="
                background: #fff;
                padding: 8px 12px;
                border-radius: 4px;
                border: 1px solid #eaecef;
                font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
                font-size: 12px;
                color: #444d56;
                line-height: 1.6;
                white-space: pre;
                text-align: left;
            ">${fieldInfo}</div>
        </details>
    `;
    formFields.appendChild(pathNotice);

    // 使用保存的 fieldEntries 来生成表单，确保顺序一致
    fieldEntries.forEach(([fieldName, field]) => {
        const div = document.createElement('div');
        div.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = field.label;
        if (field.required) {
            const requiredMark = document.createElement('span');
            requiredMark.textContent = ' *';
            requiredMark.style.color = '#ff4d4f';
            requiredMark.style.marginLeft = '4px';
            label.appendChild(requiredMark);
        }
        div.appendChild(label);

        let input;
        if (field.type === 'textarea') {
            input = document.createElement('textarea');
            input.rows = 4;
            input.value = field.default || '';
            input.id = fieldName; // 确保设置 ID
        } else if (field.type === 'select' && Array.isArray(field.options)) {
            input = document.createElement('select');
            input.id = fieldName; // 确保设置 ID
            // 添加一个默认选项
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = `请选择${field.label}`;
            input.appendChild(defaultOption);
            // 添加其他选项
            field.options.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option;
                opt.textContent = option;
                input.appendChild(opt);
            });
            // 设置默认选中值
            if (field.default) {
                input.value = field.default;
            }
        } else if (field.type === 'checkbox') {
            const wrapper = document.createElement('div');
            wrapper.className = 'checkbox-wrapper';
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'center';
            wrapper.style.gap = '8px';

            input = document.createElement('input');
            input.type = 'checkbox';
            input.id = fieldName; // 确保设置 ID
            input.style.width = 'auto';
            input.checked = field.default || false;

            // 移动标签到复选框后面
            wrapper.appendChild(input);
            label.style.marginBottom = '0';
            wrapper.appendChild(label);
            div.innerHTML = '';
            div.appendChild(wrapper);
        } else if (field.type === 'radio' && Array.isArray(field.options)) {
            const wrapper = document.createElement('div');
            wrapper.className = 'radio-group';
            wrapper.style.display = 'flex';
            wrapper.style.gap = '16px';
            wrapper.style.marginTop = '8px';

            field.options.forEach((option, index) => {
                const radioWrapper = document.createElement('div');
                radioWrapper.style.display = 'flex';
                radioWrapper.style.alignItems = 'center';
                radioWrapper.style.gap = '4px';

                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = fieldName;
                radio.id = `${fieldName}_${index}`;
                radio.value = option;
                radio.style.width = 'auto';
                radio.style.margin = '0';
                // 设置默认选中值
                if (field.default === option) {
                    radio.checked = true;
                }

                const radioLabel = document.createElement('label');
                radioLabel.htmlFor = `${fieldName}_${index}`;
                radioLabel.textContent = option;
                radioLabel.style.marginBottom = '0';
                radioLabel.style.fontWeight = 'normal';

                radioWrapper.appendChild(radio);
                radioWrapper.appendChild(radioLabel);
                wrapper.appendChild(radioWrapper);
            });

            div.appendChild(wrapper);
            // 不需要为radio组设置统一ID，每个单选按钮已有自己的ID
        } else if (field.type === 'array') {
            const wrapper = document.createElement('div');
            wrapper.className = 'array-wrapper';
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.gap = '8px';

            // 创建标签容器
            const tagsContainer = document.createElement('div');
            tagsContainer.className = 'tags-container';
            tagsContainer.style.display = 'flex';
            tagsContainer.style.flexWrap = 'wrap';
            tagsContainer.style.gap = '8px';
            tagsContainer.style.marginBottom = '8px';

            // 创建输入组
            const inputGroup = document.createElement('div');
            inputGroup.style.display = 'flex';
            inputGroup.style.gap = '8px';

            // 创建输入框
            input = document.createElement('input');
            input.type = 'text';
            input.className = 'array-text-input'; // 添加类名以便于后续查找
            input.placeholder = field.placeholder || '输入后按回车或空格添加';
            input.style.flex = '1';
            input.id = `${fieldName}_input`; // 设置一个不同的ID以避免冲突

            // 创建隐藏的实际值存储
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.id = fieldName; // 确保隐藏输入框使用字段名作为ID
            hiddenInput.className = 'array-hidden-input'; // 添加类名以便于后续查找
            hiddenInput.value = JSON.stringify(field.default || []);

            // 更新标签显示
            const updateTags = () => {
                const tags = JSON.parse(hiddenInput.value);
                tagsContainer.innerHTML = '';
                tags.forEach((tag, index) => {
                    const tagElement = document.createElement('span');
                    tagElement.className = 'tag';
                    tagElement.style.backgroundColor = '#e1e4e8';
                    tagElement.style.borderRadius = '4px';
                    tagElement.style.padding = '4px 8px';
                    tagElement.style.fontSize = '12px';
                    tagElement.style.display = 'flex';
                    tagElement.style.alignItems = 'center';
                    tagElement.style.gap = '4px';

                    tagElement.innerHTML = `
                        ${tag}
                        <span class="remove-tag" style="
                            cursor: pointer;
                            color: #666;
                            font-weight: bold;
                            font-size: 14px;
                        ">×</span>
                    `;

                    // 删除标签事件
                    tagElement.querySelector('.remove-tag').addEventListener('click', () => {
                        const currentTags = JSON.parse(hiddenInput.value);
                        const tagIndex = currentTags.indexOf(tag);
                        if (tagIndex !== -1) {
                            currentTags.splice(tagIndex, 1);
                            hiddenInput.value = JSON.stringify(currentTags);
                            tagElement.remove();
                        }
                    });

                    tagsContainer.appendChild(tagElement);
                });
            };

            // 添加标签事件
            input.addEventListener('keydown', (e) => {
                // 处理回车键和空格键
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault(); // 阻止默认行为
                    const value = input.value.trim();
                    if (value) {
                        const currentTags = JSON.parse(hiddenInput.value);
                        if (!currentTags.includes(value)) {
                            currentTags.push(value);
                            hiddenInput.value = JSON.stringify(currentTags);
                            updateTags();
                            input.value = '';
                        }
                    }
                }
            });

            // 组装组件
            wrapper.appendChild(tagsContainer);
            inputGroup.appendChild(input);
            wrapper.appendChild(inputGroup);
            wrapper.appendChild(hiddenInput);
            div.appendChild(wrapper);

            // 初始化显示
            updateTags();
        } else {
            input = document.createElement('input');
            input.type = field.type || 'text';
            input.value = field.default || '';
            input.id = fieldName; // 确保设置 ID
        }

        // 如果div中还没有任何输入元素，则添加
        if (!div.querySelector('input, textarea, select')) {
            div.appendChild(input);
        }

        formFields.appendChild(div);
    });
}

// 修改 DOMContentLoaded 事件处理
document.addEventListener('DOMContentLoaded', async () => {
    // 加载保存的语言设置
    const settings = await chrome.storage.local.get(['language']);
    currentLang = settings.language || detectLanguage();

    // 初始化语言选择器
    initializeLanguageSelector();

    // 先从本地存储加载模板
    await loadSavedTemplates();

    // 初始化模板选择器
    initializeTemplateSelect();

    // 检查 token 状态
    await checkToken();

    // 初始化设置面板
    initializeSettings();

    // 更新所有文本
    updateLanguage();

    // 显示主界面
    document.getElementById('main').style.display = 'block';

    // 添加提交按钮事件监听器
    const submitButton = document.getElementById('submit');
    if (submitButton) {
        submitButton.addEventListener('click', async () => {
            if (!currentTemplate) {
                showToast(t('error.selectTemplate'), 'error');
                return;
            }

            const repoFullName = document.getElementById('repoList').value;
            if (!repoFullName) {
                showToast(t('error.selectRepo'), 'error');
                return;
            }

            // 收集表单数据，保持字段顺序
            const formData = {};
            const fieldEntries = currentTemplate.fieldOrder.map(fieldName => [
                fieldName,
                currentTemplate.fields[fieldName]
            ]);

            console.log('fieldEntries:', fieldEntries);

            for (const [fieldName, field] of fieldEntries) {
                console.log('fieldName:', fieldName);
                console.log('field:', field);
                const element = document.getElementById(fieldName);
                console.log('element:', element);
                let value;

                // 设置默认的required属性
                field.required = field.required ?? true; // 如果未指定required，默认为true

                // 如果元素不存在，记录错误并使用默认值
                if (!element && field.type !== 'array') {
                    console.error(`元素 ${fieldName} (类型: ${field.type}) 未找到，使用默认值`);

                    // 根据字段类型设置默认值
                    if (field.type === 'checkbox') {
                        value = field.default || false;
                    } else if (field.type === 'number') {
                        value = field.default || 0;
                    } else if (field.type === 'select' || field.type === 'radio') {
                        value = field.default || '';
                    } else {
                        value = field.default || '';
                    }
                } else if (field.type === 'text' || field.type === 'date' || field.type === 'textarea' || field.type === 'select') {
                    // 文本类型字段
                    value = element ? element.value : (field.default || '');
                } else if (field.type === 'checkbox') {
                    // 复选框类型
                    value = element ? element.checked : (field.default || false);
                } else if (field.type === 'radio') {
                    // 单选按钮类型
                    const checkedRadio = document.querySelector(`input[name="${fieldName}"]:checked`);
                    value = checkedRadio ? checkedRadio.value : (field.default || '');
                } else if (field.type === 'number') {
                    // 数字类型字段
                    const rawValue = element ? element.value : '';
                    value = rawValue === '' ? (field.default || 0) : Number(rawValue);
                } else if (field.type === 'array') {
                    console.log(`处理数组字段 ${fieldName}:`, {
                        fieldType: field.type,
                        fieldLabel: field.label,
                        fieldRequired: field.required
                    });
                    // 对于数组类型，尝试多种方式找到隐藏输入元素
                    try {
                        // 首先尝试通过ID直接获取
                        console.log(`尝试通过ID获取${fieldName}`, field.type);
                        let hiddenInput = document.getElementById(fieldName);

                        console.log(`尝试通过ID获取${fieldName}`, hiddenInput);
                        // 如果找不到，尝试通过类名和选择器查找
                        if (!hiddenInput) {
                            console.log(`通过ID未找到${fieldName}，尝试其他方式查找...`);

                            // 查找带有该ID的隐藏输入元素
                            hiddenInput = document.querySelector(`input[type="hidden"][id="${fieldName}"]`);

                            // 如果还是找不到，尝试匹配类名
                            if (!hiddenInput) {
                                const arrayHiddenInputs = document.querySelectorAll('input.array-hidden-input');
                                console.log(`找到 ${arrayHiddenInputs.length} 个array-hidden-input元素`);

                                // 打印所有找到的隐藏输入元素，帮助调试
                                arrayHiddenInputs.forEach(input => {
                                    console.log(`- 隐藏输入元素:`, {
                                        id: input.id,
                                        value: input.value.substring(0, 30) + (input.value.length > 30 ? '...' : '')
                                    });
                                });

                                // 尝试通过ID匹配
                                hiddenInput = Array.from(arrayHiddenInputs).find(input => input.id === fieldName);
                            }
                        }

                        // 如果找到了隐藏输入元素
                        if (hiddenInput) {
                            console.log(`成功找到隐藏输入元素 ${fieldName}:`, {
                                id: hiddenInput.id,
                                value: hiddenInput.value
                            });

                            try {
                                // 尝试解析JSON数据
                                value = JSON.parse(hiddenInput.value);
                                if (!Array.isArray(value)) {
                                    console.warn(`字段 ${fieldName} 的值不是数组，设置为空数组`);
                                    value = [];
                                }
                                console.log(`解析后的标签数组:`, value);
                            } catch (e) {
                                console.error(`解析字段 ${fieldName} 的JSON失败:`, e);
                                value = [];
                            }
                        } else {
                            // 备用方案：直接从页面上查找字段对应的可见标签元素
                            console.log(`无法找到隐藏输入元素 ${fieldName}，尝试收集可见标签...`);

                            // 在这里可以添加备用方案，比如从页面上查找tag元素直接构建数组
                            const tagElements = document.querySelectorAll('.tag');
                            if (tagElements.length > 0) {
                                const visibleTags = [];
                                tagElements.forEach(tag => {
                                    // 获取标签文本（去除删除按钮）
                                    const tagText = tag.textContent.trim().replace('×', '').trim();
                                    if (tagText) visibleTags.push(tagText);
                                });

                                if (visibleTags.length > 0) {
                                    console.log(`从页面收集到 ${visibleTags.length} 个可见标签:`, visibleTags);
                                    value = visibleTags;
                                } else {
                                    console.warn(`未能收集到任何可见标签，使用默认值`);
                                    value = field.default || [];
                                }
                            } else {
                                console.warn(`未找到ID为${fieldName}的隐藏输入元素，且页面上没有可见标签，使用默认值`);
                                value = field.default || [];
                            }
                        }
                    } catch (e) {
                        console.error(`处理数组字段 ${fieldName} 时出错:`, e);
                        value = field.default || []; // 出错时使用默认值
                    }
                } else {
                    // 其他未知类型，直接使用元素值或默认值
                    value = element ? element.value : (field.default || '');
                }

                // 检查必填字段
                if (field.required) {
                    if (field.type === 'array') {
                        // 对于数组类型，直接检查数组长度
                        if (!Array.isArray(value) || value.length === 0) {
                            const fieldLabel = field.label;
                            showToast(t('error.fieldRequired').replace('{field}', fieldLabel), 'error');
                            return;
                        }
                    } else if (value === '' || value === null || value === undefined) {
                        // 其他类型字段的常规验证
                        const fieldLabel = field.label;
                        showToast(t('error.fieldRequired').replace('{field}', fieldLabel), 'error');
                        return;
                    }
                }
                formData[fieldName] = value;
            }

            // 调试输出表单数据
            console.log('提交的表单数据:', JSON.stringify(formData, null, 2));

            try {
                const settings = await chrome.storage.local.get(['github_token']);

                // 显示加载状态
                const originalText = t('submit');
                submitButton.disabled = true;
                submitButton.classList.add('loading');
                submitButton.textContent = t('loading');

                await appendToJsonFile(repoFullName, formData, settings.github_token);

                showToast(t('success.submit'));
                // 清空表单
                fieldEntries.forEach(([fieldName, field]) => {
                    const element = document.getElementById(fieldName);

                    // 如果元素不存在，跳过重置
                    if (!element && field.type !== 'array') {
                        console.warn(`重置表单: 元素 ${fieldName} 不存在，无法重置`);
                        return; // 跳过当前循环
                    }

                    if (field.type === 'checkbox') {
                        if (element) element.checked = field.default || false;
                    } else if (field.type === 'radio') {
                        const radios = document.querySelectorAll(`input[name="${fieldName}"]`);
                        radios.forEach(radio => radio.checked = false);
                        if (field.default) {
                            const defaultRadio = Array.from(radios).find(radio => radio.value === field.default);
                            if (defaultRadio) defaultRadio.checked = true;
                        }
                    } else if (field.type === 'select') {
                        if (element) element.value = field.default || '';
                    } else if (field.type === 'array') {
                        // 处理数组类型字段 - 重置为默认值
                        const hiddenInput = document.getElementById(fieldName);
                        if (hiddenInput) {
                            // 重置隐藏输入框的值为默认数组
                            hiddenInput.value = JSON.stringify(field.default || []);

                            // 找到包含标签容器的父元素
                            const arrayWrapper = hiddenInput.closest('.array-wrapper');
                            if (arrayWrapper) {
                                // 清空标签容器
                                const tagsContainer = arrayWrapper.querySelector('.tags-container');
                                if (tagsContainer) {
                                    tagsContainer.innerHTML = '';
                                }

                                // 如果有默认标签，重新渲染
                                const defaultTags = field.default || [];
                                if (defaultTags.length > 0) {
                                    // 重新渲染默认标签
                                    defaultTags.forEach(tag => {
                                        const tagElement = document.createElement('span');
                                        tagElement.className = 'tag';
                                        tagElement.style.backgroundColor = '#e1e4e8';
                                        tagElement.style.borderRadius = '4px';
                                        tagElement.style.padding = '4px 8px';
                                        tagElement.style.fontSize = '12px';
                                        tagElement.style.display = 'flex';
                                        tagElement.style.alignItems = 'center';
                                        tagElement.style.gap = '4px';

                                        tagElement.innerHTML = `
                                            ${tag}
                                            <span class="remove-tag" style="
                                                cursor: pointer;
                                                color: #666;
                                                font-weight: bold;
                                                font-size: 14px;
                                            ">×</span>
                                        `;

                                        // 删除标签事件
                                        tagElement.querySelector('.remove-tag').addEventListener('click', () => {
                                            const currentTags = JSON.parse(hiddenInput.value);
                                            const tagIndex = currentTags.indexOf(tag);
                                            if (tagIndex !== -1) {
                                                currentTags.splice(tagIndex, 1);
                                                hiddenInput.value = JSON.stringify(currentTags);
                                                tagElement.remove();
                                            }
                                        });

                                        tagsContainer.appendChild(tagElement);
                                    });
                                }

                                // 清空输入框
                                const textInput = arrayWrapper.querySelector('input[type="text"]');
                                if (textInput) {
                                    textInput.value = '';
                                }
                            }
                        }
                    } else {
                        // 其他类型字段
                        if (element) element.value = field.default || '';
                    }
                });

                // 恢复按钮状态
                submitButton.disabled = false;
                submitButton.classList.remove('loading');
                submitButton.textContent = originalText;
            } catch (error) {
                //console.error('提交失败:', error);

                // 特殊处理 "Resource not accessible by personal access token" 错误
                if (error.message.includes('Resource not accessible by personal access token')) {
                    showToast(t('error.accessDenied') || '权限不足，无法访问该资源。请确保您的Token有足够权限或选择其他仓库。', 'error');
                } else {
                    showToast(error.message, 'error');
                }

                // 恢复按钮状态
                submitButton.disabled = false;
                submitButton.classList.remove('loading');
                submitButton.textContent = t('submit');
            }
        });
    }
});

// 将模板选择相关的代码封装到一个函数中
function initializeTemplateSelect() {
    // 更新选择列表
    updateTemplateSelect();

    // 绑定选择事件
    const templateSelect = document.getElementById('templateSelect');
    if (templateSelect) {
        templateSelect.addEventListener('change', function (e) {
            const templateName = e.target.value;
            document.getElementById('formFields').innerHTML = '';
            currentTemplate = null;

            if (templateName && TEMPLATES[templateName]) {
                generateFormFields(templateName);
            }
        });
    } else {
        //console.error('模板选择元素未找到');
        showToast('Not found template select');
    }
}

// 更新模板选择列表
function updateTemplateSelect() {
    const templateSelect = document.getElementById('templateSelect');
    if (!templateSelect) {
        //console.error('找不到模板选择元素');
        return;
    }

    // 清空现有选项
    templateSelect.innerHTML = '<option value="">请选择模板</option>';

    // 添加新选项
    Object.entries(TEMPLATES).forEach(([key, template]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = template.name;
        templateSelect.appendChild(option);
    });

    // 调试日志
    console.log('模板列表已更新:', {
        templates: TEMPLATES,
        selectOptions: templateSelect.innerHTML
    });
}

// 生成更明确的文件名
function generateFilename(formData) {
    const date = new Date().toISOString().split('T')[0];  // 获取当前日期 YYYY-MM-DD
    const sanitizedTitle = formData.title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')  // 非字母数字替换为横线
        .replace(/^-+|-+$/g, '');     // 删除首尾横线

    return `data/${date}-${sanitizedTitle}.json`;  // 例如: data/2024-03-20-my-title.json
}

async function appendToJsonFile(repoFullName, formData, token) {
    const filename = currentTemplate.filename;

    try {
        let existingData = [];
        let fileData = null;
        let checkResponse = null;

        try {
            checkResponse = await fetch(
                `https://api.github.com/repos/${repoFullName}/contents/${filename}`,
                {
                    headers: {
                        'Authorization': `token ${token}`,
                    }
                }
            );

            if (checkResponse.ok) {
                fileData = await checkResponse.json();
                // 使用 TextDecoder 解码 base64 内容
                const decoder = new TextDecoder('utf-8');
                const bytes = Uint8Array.from(atob(fileData.content), c => c.charCodeAt(0));
                const content = decoder.decode(bytes);
                try {
                    existingData = JSON.parse(content);
                    if (!Array.isArray(existingData)) {
                        console.log('现有文件不是数组格式，将重置为空数组');
                        existingData = [];
                    }
                } catch (e) {
                    console.log('解析现有文件失败，将重置为空数组');
                    existingData = [];
                }
            } else if (checkResponse.status === 404) {
                console.log('文件不存在，将创建新文件');
                existingData = [];
            } else {
                throw new Error('检查文件状态失败');
            }
        } catch (error) {
            if (error.message !== '文件不存在，将创建新文件') {
                console.warn('读取文件时出错:', error);
            }
            existingData = [];
        }

        const newEntry = {
            ...formData,
            timestamp: new Date().toISOString()
        };
        existingData.push(newEntry);

        // 使用 TextEncoder 进行 UTF-8 编码
        const encoder = new TextEncoder();
        const jsonString = JSON.stringify(existingData, null, 2);
        const bytes = encoder.encode(jsonString);
        const base64Content = btoa(String.fromCharCode(...bytes));

        const response = await fetch(
            `https://api.github.com/repos/${repoFullName}/contents/${filename}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Add new entry via Chrome extension`,
                    content: base64Content,
                    sha: fileData?.sha
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '提交失败');
        }

        return true;
    } catch (error) {
        console.error('提交失败:', error);
        throw error;
    }
}

// 修改 showToast 函数以支持翻译
function showToast(message, type = 'success') {
    // 检查是否是预定义消息的key
    const section = type === 'success' ? 'success' : 'error';
    const translatedMessage = i18n[currentLang][section]?.[message] || message;

    // 移除现有的 toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = translatedMessage;
    document.body.appendChild(toast);

    // 强制重绘
    toast.offsetHeight;

    // 添加 show 类来触发动画
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300); // 等待淡出动画完成后移除
    }, 3000);
}

// 修改 showConfirmToast 函数以支持翻译
function showConfirmToast(message, onConfirm) {
    const translatedMessage = i18n[currentLang].token.confirmReset || message;

    // 移除现有的确认框
    const existingConfirm = document.querySelector('.confirm-toast');
    if (existingConfirm) {
        existingConfirm.remove();
    }

    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'confirm-toast';

    const messageDiv = document.createElement('div');
    messageDiv.className = 'confirm-message';
    messageDiv.textContent = translatedMessage;

    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'confirm-buttons';

    const confirmButton = document.createElement('button');
    confirmButton.className = 'confirm-yes';
    confirmButton.textContent = t('yes');
    confirmButton.onclick = () => {
        onConfirm();
        confirmDialog.remove();
    };

    const cancelButton = document.createElement('button');
    cancelButton.className = 'confirm-no';
    cancelButton.textContent = t('no');
    cancelButton.onclick = () => confirmDialog.remove();

    buttonDiv.appendChild(confirmButton);
    buttonDiv.appendChild(cancelButton);

    confirmDialog.appendChild(messageDiv);
    confirmDialog.appendChild(buttonDiv);
    document.body.appendChild(confirmDialog);

    // 强制重绘并显示
    confirmDialog.offsetHeight;
    confirmDialog.classList.add('show');
}

// 加载仓库列表
async function loadRepos() {
    const repoList = document.getElementById('repoList');
    repoList.innerHTML = `<option value="">${t('loading')}</option>`;

    try {
        const settings = await chrome.storage.local.get(['github_token']);

        const allRepos = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const response = await fetch(`https://api.github.com/user/repos?per_page=100&page=${page}&type=all&sort=full_name`, {
                headers: {
                    'Authorization': `token ${settings.github_token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error(t('error.loadRepos'));
            }

            const repos = await response.json();
            allRepos.push(...repos);

            hasMore = repos.length === 100;
            page += 1;
        }

        repoList.innerHTML = `<option value="">${t('selectRepo')}</option>`;

        allRepos
            .sort((a, b) => a.full_name.localeCompare(b.full_name))
            .forEach(repo => {
                const option = document.createElement('option');
                option.value = repo.full_name;
                option.textContent = repo.full_name;
                repoList.appendChild(option);
            });
    } catch (error) {
        //console.error('Error loading repos:', error);
        repoList.innerHTML = `<option value="">${t('error.loadRepos')}</option>`;
        showToast(t('error.loadRepos'), 'error');
    }
}

// 格式化JSON字符串时保留键的顺序
function formatJSON(obj, indent = 2) {
    // 针对模板格式的特殊处理
    if (typeof obj === 'object' && obj !== null) {
        const isArray = Array.isArray(obj);
        
        // 数组直接格式化
        if (isArray) {
            const formattedItems = obj.map(item => formatJSON(item, indent)).join(',\n');
            return `[\n${' '.repeat(indent)}${formattedItems}\n]`;
        }
        
        // 对象需要特殊处理以保留顺序
        let result = '{\n';
        
        // 模板对象的标准字段顺序
        const standardTemplateOrder = ['name', 'filename', 'fieldOrder', 'fields'];
        
        // 处理模板对象 - 首先检查是否是模板对象
        const isTemplateObj = obj.name && obj.filename && obj.fieldOrder && obj.fields;
        
        if (isTemplateObj) {
            // 按照标准模板字段顺序处理
            standardTemplateOrder.forEach((key, index) => {
                if (key in obj) {
                    const value = obj[key];
                    const comma = index < standardTemplateOrder.length - 1 ? ',' : '';
                    
                    // 特殊处理fields字段，按fieldOrder排序
                    if (key === 'fields' && typeof value === 'object' && value !== null && obj.fieldOrder) {
                        result += `${' '.repeat(indent)}"${key}": {\n`;
                        
                        // 按fieldOrder排序字段
                        obj.fieldOrder.forEach((fieldName, fieldIndex) => {
                            if (value[fieldName]) {
                                const fieldComma = fieldIndex < obj.fieldOrder.length - 1 ? ',' : '';
                                result += `${' '.repeat(indent * 2)}"${fieldName}": ${formatJSON(value[fieldName], indent * 2)}${fieldComma}\n`;
                            }
                        });
                        
                        result += `${' '.repeat(indent)}}${comma}\n`;
                    } else {
                        result += `${' '.repeat(indent)}"${key}": ${formatJSON(value, indent * 2)}${comma}\n`;
                    }
                }
            });
        } else {
            // 对于非模板对象，保持原始定义顺序
            const entries = Object.entries(obj);
            entries.forEach(([key, value], index) => {
                const comma = index < entries.length - 1 ? ',' : '';
                result += `${' '.repeat(indent)}"${key}": ${formatJSON(value, indent * 2)}${comma}\n`;
            });
        }
        
        result += '}';
        return result;
    }
    
    // 基本类型直接使用JSON.stringify
    return JSON.stringify(obj);
}

// 设置面板相关功能
function initializeSettings() {
    const mainDiv = document.getElementById('main');
    const settingsDiv = document.getElementById('settings');
    const templatesEditor = document.getElementById('templatesEditor');

    // 打开设置
    document.getElementById('openSettings').addEventListener('click', () => {
        mainDiv.style.display = 'none';
        settingsDiv.style.display = 'block';

        // 优先使用保存的文本格式
        if (window.savedTemplatesText) {
            templatesEditor.value = window.savedTemplatesText;
            return;
        }

        // 否则使用自定义格式化函数加载当前模板到编辑器，保持字段顺序
        try {
            // 对每个模板应用格式化
            let formattedTemplates = '{\n';
            const templates = Object.entries(TEMPLATES);

            templates.forEach(([templateKey, templateValue], index) => {
                const comma = index < templates.length - 1 ? ',' : '';
                formattedTemplates += `  "${templateKey}": ${formatJSON(templateValue, 4).replace(/\n/g, '\n  ')}${comma}\n`;
            });

            formattedTemplates += '}';
            templatesEditor.value = formattedTemplates;
        } catch (error) {
            console.error('格式化模板时出错:', error);
            // 出错时回退到标准JSON格式化
            templatesEditor.value = JSON.stringify(TEMPLATES, null, 2);
        }
    });

    // 返回主界面
    document.getElementById('backToMain').addEventListener('click', () => {
        settingsDiv.style.display = 'none';
        mainDiv.style.display = 'block';
    });

    // 保存模板
    document.getElementById('saveTemplates').addEventListener('click', async () => {
        try {
            // 直接使用编辑器中的文本，这样可以保持用户编辑的格式和顺序
            const templateText = templatesEditor.value;
            const newTemplates = JSON.parse(templateText);

            if (Object.keys(newTemplates).length === 0) {
                await chrome.storage.local.set({ templates: newTemplates });
                TEMPLATES = {};
                updateTemplateSelect();
                showToast(t('templates.success.save'));
            } else if (validateTemplates(newTemplates)) {
                // 保存原始文本格式到一个额外的字段，以便将来编辑时保持格式
                await chrome.storage.local.set({
                    templates: newTemplates,
                    templatesText: templateText
                });

                // 确保templates对象中的属性按照标准顺序排列
                const orderedTemplates = {};
                Object.keys(newTemplates).forEach(templateKey => {
                    const template = newTemplates[templateKey];
                    // 创建一个按照标准顺序排列的模板对象
                    orderedTemplates[templateKey] = {
                        name: template.name,
                        filename: template.filename,
                        fieldOrder: template.fieldOrder,
                        fields: {}
                    };
                    
                    // 按照fieldOrder排序fields
                    template.fieldOrder.forEach(fieldName => {
                        if (template.fields[fieldName]) {
                            orderedTemplates[templateKey].fields[fieldName] = template.fields[fieldName];
                        }
                    });
                });
                
                TEMPLATES = orderedTemplates;
                updateTemplateSelect();
                showToast(t('templates.success.save'));
            }
        } catch (error) {
            showToast(t('templates.error.format') + ': ' + error.message, 'error');
        }
    });

    // 导出模板
    document.getElementById('exportTemplates').addEventListener('click', () => {
        // 获取当前日期，格式为 YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        try {
            // 直接使用编辑器中的内容，保持用户可能的手动修改
            const blob = new Blob([templatesEditor.value], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${today}-templates.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('导出模板时出错:', error);
            showToast(t('templates.error.export') + error.message, 'error');
        }
    });

    // 导入模板
    document.getElementById('importTemplates').addEventListener('click', () => {
        document.getElementById('importTemplatesFile').click();
    });

    document.getElementById('importTemplatesFile').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const templates = JSON.parse(e.target.result);
                    if (validateTemplates(templates)) {
                        // 直接使用原始字符串保留格式和顺序
                        templatesEditor.value = e.target.result;
                        showToast(t('templates.success.import'));
                    }
                } catch (error) {
                    showToast(t('templates.error.import') + error.message, 'error');
                }
            };
            reader.readAsText(file);
        }
    });

    // Token 管理
    document.getElementById('settingsSaveToken').addEventListener('click', async () => {
        const token = document.getElementById('settingsToken').value.trim();
        if (token) {
            try {
                await chrome.storage.local.set({ github_token: token });
                showToast(t('token.success.update'));
                document.getElementById('settingsToken').value = '';
                settingsDiv.style.display = 'none';
                mainDiv.style.display = 'block';
                await checkToken();
            } catch (error) {
                showToast(error.message, 'error');
            }
        } else {
            showToast(t('token.error.required'), 'error');
        }
    });

    // 修改重置 Token 的代码
    document.getElementById('settingsResetToken').addEventListener('click', () => {
        showConfirmToast(t('token.confirmReset'), async () => {
            await chrome.storage.local.remove('github_token');
            showToast(t('token.success.reset'));
            settingsDiv.style.display = 'none';
            mainDiv.style.display = 'block';
            await checkToken();
        });
    });
}

// 验证模板格式
function validateTemplates(templates) {
    for (const [key, template] of Object.entries(templates)) {
        if (!template.name || typeof template.name !== 'string') {
            throw new Error(`Template ${key} missing name property`);
        }
        if (!template.fields || typeof template.fields !== 'object') {
            throw new Error(`Template ${key} missing fields property`);
        }
        if (!template.filename || typeof template.filename !== 'string') {
            throw new Error(`Template ${key} missing filename property`);
        }
        if (!template.fieldOrder || !Array.isArray(template.fieldOrder)) {
            // 如果没有 fieldOrder，自动生成一个
            template.fieldOrder = Object.keys(template.fields);
        }
        // 验证 fieldOrder 中的字段都存在于 fields 中
        for (const fieldName of template.fieldOrder) {
            if (!template.fields[fieldName]) {
                throw new Error(`Template ${key} fieldOrder contains undefined field: ${fieldName}`);
            }
        }
        // 验证所有 fields 中的字段都在 fieldOrder 中
        for (const fieldName of Object.keys(template.fields)) {
            if (!template.fieldOrder.includes(fieldName)) {
                throw new Error(`Template ${key} field ${fieldName} not in fieldOrder`);
            }
        }
    }
    return true;
}

// 修改模板加载函数
async function loadSavedTemplates() {
    const result = await chrome.storage.local.get(['templates', 'templatesText']);
    if (result.templates !== undefined) {
        // 确保templates对象中的属性按照标准顺序排列
        const orderedTemplates = {};
        Object.keys(result.templates).forEach(templateKey => {
            const template = result.templates[templateKey];
            // 创建一个按照标准顺序排列的模板对象
            orderedTemplates[templateKey] = {
                name: template.name,
                filename: template.filename,
                fieldOrder: template.fieldOrder,
                fields: {}
            };
            
            // 按照fieldOrder排序fields
            template.fieldOrder.forEach(fieldName => {
                if (template.fields[fieldName]) {
                    orderedTemplates[templateKey].fields[fieldName] = template.fields[fieldName];
                }
            });
        });
        
        TEMPLATES = orderedTemplates;
        
        // 保存文本格式以便将来编辑时使用
        if (result.templatesText) {
            window.savedTemplatesText = result.templatesText;
        }
    }
}

// 初始化语言选择器
function initializeLanguageSelector() {
    const languageSelect = document.getElementById('languageSelect');
    if (!languageSelect) return;

    // 清空现有选项
    languageSelect.innerHTML = '';

    // 添加支持的语言选项
    Object.entries(SUPPORTED_LANGUAGES).forEach(([code, name]) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = name;
        languageSelect.appendChild(option);
    });

    // 设置当前选中的语言
    languageSelect.value = currentLang;

    // 添加切换事件
    languageSelect.addEventListener('change', async (e) => {
        currentLang = e.target.value;
        await chrome.storage.local.set({ language: currentLang });
        updateLanguage();
        // 重新加载仓库列表以更新文本
        await loadRepos();
    });
} 