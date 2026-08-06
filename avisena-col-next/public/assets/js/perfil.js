
        const dom = {
            form: document.getElementById('profile-form'),
            fields: document.getElementById('form-fields'),
            btnEdit: document.getElementById('btn-edit'),
            btnSave: document.getElementById('btn-save'),
            btnCancel: document.getElementById('btn-cancel'),
            badge: document.getElementById('edit-badge'),
            alert: document.getElementById('success-alert'),
            titleName: document.getElementById('user-title-name'),
            inNombre: document.getElementById('in-nombre'),
            fileInput: document.getElementById('file-input'),
            profileDisplay: document.getElementById('profile-display'),
            headerAvatar: document.getElementById('header-avatar')
        };

        dom.btnEdit.addEventListener('click', () => {
            dom.fields.disabled = false;
            dom.btnEdit.classList.add('hidden');
            dom.btnSave.classList.remove('hidden');
            dom.btnCancel.classList.remove('hidden');
            dom.badge.innerText = "Modo Edición";
            dom.badge.className = "px-3 py-1 bg-brand-light text-brand-green text-[10px] font-bold rounded-full uppercase tracking-wider";
        });

        dom.btnCancel.addEventListener('click', () => {
            dom.fields.disabled = true;
            dom.btnEdit.classList.remove('hidden');
            dom.btnSave.classList.add('hidden');
            dom.btnCancel.classList.add('hidden');
            dom.badge.innerText = "Modo Lectura";
            dom.badge.className = "px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-full uppercase tracking-wider";
            dom.form.reset();
        });

        dom.form.addEventListener('submit', (e) => {
            e.preventDefault();
            dom.titleName.innerText = dom.inNombre.value;
            dom.fields.disabled = true;
            dom.btnEdit.classList.remove('hidden');
            dom.btnSave.classList.add('hidden');
            dom.btnCancel.classList.add('hidden');
            dom.badge.innerText = "Modo Lectura";
            dom.badge.className = "px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-full uppercase tracking-wider";
            dom.alert.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => dom.alert.classList.add('hidden'), 4000);
        });

        dom.fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const url = `url(${e.target.result})`;
                    dom.profileDisplay.style.backgroundImage = url;
                    dom.headerAvatar.style.backgroundImage = url;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
