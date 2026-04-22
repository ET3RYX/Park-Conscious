import re

def fix_html(filepath, active_link):
    with open('c:/Users/sujal/OneDrive/Documents/praccodes/parkconsciouspkcs/Park-Conscious/web/about.html', 'r', encoding='utf-8') as f:
        about_html = f.read()

    style_match = re.search(r'<style>.*?</style>', about_html, re.DOTALL)
    about_style = style_match.group(0)

    nav_match = re.search(r'<!-- Navigation -->.*?<!-- Main Content -->', about_html, re.DOTALL)
    about_nav = nav_match.group(0).replace('<!-- Main Content -->', '').strip()

    footer_match = re.search(r'<!-- Footer -->.*?</footer>', about_html, re.DOTALL)
    about_footer = footer_match.group(0)

    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    html = re.sub(r'<style>.*?</style>', about_style, html, flags=re.DOTALL)
    
    html = re.sub(r'<body[^>]*>', '<body class="bg-white text-slate-900 selection:bg-teal-100 selection:text-teal-900 flex flex-col min-h-screen">', html)

    replacements = {
        'bg-gray-950': 'bg-slate-50',
        'text-gray-200': 'text-slate-900',
        'text-white': 'text-slate-900',
        'text-gray-400': 'text-slate-500',
        'text-gray-300': 'text-slate-600',
        'text-blue-500': 'text-[#00C39A]',
        'text-blue-400': 'text-[#00C39A]',
        'text-teal-400': 'text-[#00C39A]',
        'text-teal-500': 'text-[#00C39A]',
        'text-purple-400': 'text-[#00C39A]',
        'bg-white/5': 'bg-white',
        'bg-white/10': 'bg-slate-100',
        'hover:bg-white/5': 'hover:bg-slate-50',
        'hover:bg-white/20': 'hover:bg-slate-200',
        'border-white/10': 'border-slate-200',
        'border-white/20': 'border-slate-300',
        'bg-blue-500/20': 'bg-[#00C39A]/10',
        'bg-teal-500/20': 'bg-[#00C39A]/10',
        'bg-purple-500/20': 'bg-[#00C39A]/10',
        'glass': 'bg-white border border-slate-100 shadow-xl shadow-slate-200/50',
        'bg-gradient-to-r from-blue-600 to-teal-500': 'btn-primary',
        'shadow-blue-500/30': 'shadow-[#00C39A]/30',
        'shadow-blue-500/20': 'shadow-[#00C39A]/20',
        'main-gradient': 'bg-slate-50 relative overflow-hidden',
        'bg-gray-800': 'bg-slate-50',
        'border-gray-600': 'border-slate-300',
        'text-gray-500': 'text-slate-500',
        'text-gray-600': 'text-slate-600',
        'bg-gray-900': 'bg-slate-100'
    }

    html = re.sub(r'<nav.*?</nav>', '<!-- NAV_PLACEHOLDER -->', html, flags=re.DOTALL)
    # The target files have some extra scripts or tags around footer
    html = re.sub(r'<footer.*?</footer>', '<!-- FOOTER_PLACEHOLDER -->', html, flags=re.DOTALL)

    for old, new in replacements.items():
        html = html.replace(old, new)
        
    custom_nav = about_nav
    if active_link == 'technology':
        custom_nav = custom_nav.replace('<a href="index.html#solution"', '<a href="technology.html" class="text-[#00C39A] font-medium transition-colors">Technology</a>\n          <a href="index.html#solution"')
        custom_nav = custom_nav.replace('<a href="about.html" class="text-[#00C39A] font-medium transition-colors">About</a>', '<a href="about.html" class="text-slate-600 hover:text-[#00C39A] font-medium transition-colors">About</a>')
    elif active_link == 'contact':
        # Ensure about is un-active in the top nav
        custom_nav = custom_nav.replace('<a href="about.html" class="text-[#00C39A] font-medium transition-colors">About</a>', '<a href="about.html" class="text-slate-600 hover:text-[#00C39A] font-medium transition-colors">About</a>')

    html = html.replace('<!-- NAV_PLACEHOLDER -->', custom_nav)
    html = html.replace('<!-- FOOTER_PLACEHOLDER -->', about_footer)

    html = html.replace('<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">', '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32 lg:pt-48 relative z-10 w-full flex-grow">')
    html = html.replace('<div class="flex-1 flex items-center justify-center p-4">', '<div class="flex-1 flex items-center justify-center p-4 pt-32 lg:pt-48 relative z-10 w-full">')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
        
fix_html('c:/Users/sujal/OneDrive/Documents/praccodes/parkconsciouspkcs/Park-Conscious/web/technology.html', 'technology')
fix_html('c:/Users/sujal/OneDrive/Documents/praccodes/parkconsciouspkcs/Park-Conscious/web/contact.html', 'contact')
print("Done")
