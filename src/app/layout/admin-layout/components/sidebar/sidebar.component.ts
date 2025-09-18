import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
   isOpen = true;
  active = 'Dashboard';
  isMobile = false;
  
  private platformId = inject(PLATFORM_ID);

  toggleSidebar() {
  this.isOpen = !this.isOpen;
  const toggleBtn = document.querySelector('.menu-toggle');
  if (toggleBtn) {
    toggleBtn.classList.toggle('active', this.isOpen);
  }
}

  setActive(label: string) {
    this.active = label;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('activeSection', label);
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const savedActive = localStorage.getItem('activeSection');
      if (savedActive) {
        this.active = savedActive;
      }

      this.detectMobile();
    }
  }

  @HostListener('window:resize')
  detectMobile() {
    this.isMobile = window.innerWidth < 768;

    // Si está en móvil, colapsa el sidebar (solo iconos)
    this.isOpen = !this.isMobile;
  }
}
