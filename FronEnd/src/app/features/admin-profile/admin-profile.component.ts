import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../../service/reviews.service';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.css']
})
export class AdminProfileComponent implements OnInit {
  userData: any;
  reviews: any[] = [];  // Aquí se almacenarán las reviews
  userRole: string = 'admin';

  constructor(
    private authService: AuthService,
    private reviewService: ReviewService
  ) { }

  ngOnInit(): void {
    this.loadUserData();
    this.loadReviews();  // Cargar las reviews al iniciar el componente
  }

  loadUserData(): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.error('Usuario no autenticado.');
      return;
    }
    this.userData = currentUser;
    console.log('Datos del usuario:', this.userData);
  }

  loadReviews(): void {
    this.reviewService.getAllReviews().subscribe(
      (data) => {
        this.reviews = data;
        console.log('Reviews cargadas:', this.reviews);
      },
      (error) => {
        console.error('Error al cargar las reviews:', error);
      }
    );
  }
}
