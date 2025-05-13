import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Redirect,
  Render,
  Req,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Cookies } from './decorator/cookie.decorator';
import { AuthenticatedGuard } from './auth/authenticated.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { url } from 'inspector';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('admin')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index.hbs')
  root() {
    return { message: 'Hello world!' };
  }

  @Get('login')
  @Render('login')
  loginPage() {
    return { data: {} };
  }

  @Post('login')
  @Redirect()
  async loginPost(
    @Body() body: any,
    @Req() req,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    // Lưu cookie khi đăng nhập thành công
    const data = await this.appService.login(body);
    if (data.success === true) {
      res.setCookie('statusLogin', 'success', {
        httpOnly: true,
        path: '/',
      });

      return { url: '/admin/dashboard' };
    }
    return res.view('/login', {
      data: { err: 'Tài khoản hoặc mật khẩu không chính xác !' },
    });
  }

  @Get('dashboard')
  @UseGuards(AuthenticatedGuard)
  @Render('dashboard')
  dashboard() {
    return this.appService.getDashBoardData();
  }

  @Get('logout')
  @UseGuards(AuthenticatedGuard)
  @Redirect()
  logout(@Res({ passthrough: true }) res: FastifyReply) {
    res.clearCookie('statusLogin', { path: '/' });
    return {
      url: '/admin/login',
    };
  }

  @Get('categories')
  @UseGuards(AuthenticatedGuard)
  @Render('category/category')
  category(@Query() query: any) {
    return this.appService.getCategories(query);
  }

  @Get('categories/add')
  @UseGuards(AuthenticatedGuard)
  @Render('category/add-category')
  categoryAdd() {
    return { data: {} };
  }

  @Post('categories/add')
  @UseGuards(AuthenticatedGuard)
  @Redirect()
  categoryAddPost(
    @Body() body: any,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    return this.appService.addCategoryById(body, res);
  }

  @Get('categories/delete/:id')
  @UseGuards(AuthenticatedGuard)
  @Redirect()
  categoryDeletePost(@Param('id') id: string, @Body() body: any) {
    return this.appService.deleteCategoryById(id, body);
  }

  @Post('categories/edit/:id')
  @UseGuards(AuthenticatedGuard)
  @Redirect()
  categoryEditPost(
    @Param('id') id: string,
    @Body() body: any,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    return this.appService.editCategoryById(id, body, res);
  }

  @Get('categories/edit/:id')
  @UseGuards(AuthenticatedGuard)
  @Render('category/edit-category')
  categoryEdit(@Param('id') id: string) {
    return this.appService.getCategoryById(id);
  }

  @Get('products')
  @UseGuards(AuthenticatedGuard)
  @Render('product/product')
  product(@Query() query: any) {
    return this.appService.getProducts(query);
  }

  @Get('products/add')
  @UseGuards(AuthenticatedGuard)
  @Render('product/add-product')
  productAdd() {
    return this.appService.getCategoryForProduct();
  }

  @Post('products/add')
  @UseGuards(AuthenticatedGuard)
  @Redirect()
  async productAddPost(@Req() req: FastifyRequest) {
    await this.appService.addProduct(req);

    return {
      url: '/admin/products',
    };
  }

  @Get('products/edit/:id')
  @UseGuards(AuthenticatedGuard)
  @Render('product/edit-product')
  productEdit(@Param('id') id: string) {
    return this.appService.getProductById(id);
  }

  @Post('products/edit/:id')
  @UseGuards(AuthenticatedGuard)
  @Redirect()
  productEditPost(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: FastifyRequest,
  ) {
    return this.appService.editProductById(id, body, req);
  }

  @Get('products/delete/:id')
  @UseGuards(AuthenticatedGuard)
  @Redirect()
  productDeletePost(@Param('id') id: string, @Body() body: any) {
    return this.appService.deleteProductById(id, body);
  }

  @Get('users')
  @UseGuards(AuthenticatedGuard)
  @Render('user/user')
  user(@Query() query: any) {
    return this.appService.getUsers(query);
  }

  @Get('users/add')
  @UseGuards(AuthenticatedGuard)
  @Render('user/add-user')
  userAdd() {
    return { data: {} };
  }

  @Post('users/add')
  @UseGuards(AuthenticatedGuard)
  @Redirect()
  userAddPost(
    @Body() body: any,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    return this.appService.addUser(body, res);
  }

  @Get('users/edit/:id')
  @UseGuards(AuthenticatedGuard)
  @Render('user/edit-user')
  userEdit(@Param('id') id: string) {
    return this.appService.getUserById(id);
  }

  @Post('users/edit/:id')
  @UseGuards(AuthenticatedGuard)
  @Redirect()
  userEditPost(
    @Param('id') id: string,
    @Body() body: any,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    return this.appService.editUserById(id, body, res);
  }

  @Get('users/delete/:id')
  @UseGuards(AuthenticatedGuard)
  @Redirect()
  userDeletePost(@Param('id') id: string, @Body() body: any) {
    return this.appService.deleteUserById(id, body);
  }

  // BANNER START--------------------------------------------------------------------------------------

  // Lấy tất cả (banner) quảng cáo cho web khác
  @Get('banners')
  @UseGuards(AuthenticatedGuard)
  @Render('banner/banner')
  getAllBanner(@Query() query: any) {
    return this.appService.getAllBanners(query);
  }

  // Hiển thị trang thêm mới banner
  @Get('banners/add')
  @UseGuards(AuthenticatedGuard)
  @Render('banner/add-banner')
  getAddBanner() {
    return { data: {} };
  }

  // Gửi thông tin banner để thêm mới
  @Post('banners/add')
  @UseGuards(AuthenticatedGuard)
  @Redirect()
  postAddBanner(@Req() req: FastifyRequest) {
    return this.appService.postAddBanner(req);
  }

  // Hiển thị trang sửa banner bằng id
  @Get('banners/edit/:id')
  @UseGuards(AuthenticatedGuard)
  @Render('banner/edit-banner')
  getBannerById(@Param('id') id: string) {
    return this.appService.getBannerById(id);
  }

  // Gửi thông tin để sửa banner bằng id
  @Post('banners/edit/:id')
  @UseGuards(AuthenticatedGuard)
  @Redirect()
  postEditBannerById(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.appService.postEditBannerById(id, req);
  }

  // Xóa banner
  @Get('banners/delete/:id')
  @UseGuards(AuthenticatedGuard)
  @Redirect()
  getDeleteBannerById(@Param('id') id: string) {
    return this.appService.getDeleteBannerById(id);
  }

  // BANNER END--------------------------------------------------------------------------------------
  // COMMENT START--------------------------------------------------------------------------------------

  // Lấy tất cả (comment) bình luận
  @Get('comments')
  @UseGuards(AuthenticatedGuard)
  @Render('comment/comment')
  getAllComment(@Query() query: any) {
    return this.appService.getAllComments(query);
  }

  // Hiển thị trang sửa comment bằng id
  @Get('comments/edit/:id')
  @UseGuards(AuthenticatedGuard)
  @Render('comment/edit-comment')
  getCommentById(@Param('id') id: string) {
    return this.appService.getCommentById(id);
  }

  // Gửi thông tin để sửa comment bằng id
  @Post('comments/edit/:id')
  @UseGuards(AuthenticatedGuard)
  @Redirect()
  postEditCommentById(@Param('id') id: string, @Body() body: any) {
    return this.appService.postEditCommentById(id, body);
  }

  // Xóa comment
  @Get('comments/delete/:id')
  @UseGuards(AuthenticatedGuard)
  @Redirect()
  getDeleteCommentById(@Param('id') id: string) {
    return this.appService.getDeleteCommentById(id);
  }

  // COMMENT END--------------------------------------------------------------------------------------
  // ORDER START----------------------------------------------------------------------------------------

  // Lấy tất cả (order) đơn hàng
  @Get('orders')
  @UseGuards(AuthenticatedGuard)
  @Render('order/order')
  getAllOrder(@Query() query: any) {
    return this.appService.getAllOrders(query);
  }

  // Hiển thị trang sửa order bằng id
  @Get('orders/edit/:id')
  @UseGuards(AuthenticatedGuard)
  @Render('order/edit-order')
  getOrderById(@Param('id') id: string) {
    return this.appService.getOrderById(id);
  }

  // Gửi thông tin để sửa order bằng id
  @Post('orders/edit/:id')
  @UseGuards(AuthenticatedGuard)
  @Redirect()
  postEditOrderById(@Param('id') id: string, @Body() body: any) {
    return this.appService.postEditOrderById(id, body);
  }

  // Xóa order
  @Get('orders/delete/:id')
  @UseGuards(AuthenticatedGuard)
  @Redirect()
  getDeleteOrderById(@Param('id') id: string) {
    return this.appService.getDeleteOrderById(id);
  }

  // ORDER END----------------------------------------------------------------------------------------
  // SLIDER START----------------------------------------------------------------------------------------

  // Lấy tất cả (slider) quảng cáo của shop
  @Get('sliders')
  @UseGuards(AuthenticatedGuard)
  @Render('slider/slider')
  getAllSlider(@Query() query: any) {
    return this.appService.getAllSliders(query);
  }

  // Hiển thị trang thêm mới slider
  @Get('sliders/add')
  @UseGuards(AuthenticatedGuard)
  @Render('slider/add-slider')
  getAddSlider() {
    return { data: {} };
  }

  // Gửi thông tin slider để thêm mới
  @Post('sliders/add')
  @UseGuards(AuthenticatedGuard)
  @Redirect()
  postAddSlider(@Req() req: FastifyRequest) {
    return this.appService.postAddSlider(req);
  }

  // Hiển thị trang sửa slider bằng id
  @Get('sliders/edit/:id')
  @UseGuards(AuthenticatedGuard)
  @Render('slider/edit-slider')
  getSliderById(@Param('id') id: string) {
    return this.appService.getSliderById(id);
  }

  // Gửi thông tin để sửa slider bằng id
  @Post('sliders/edit/:id')
  @UseGuards(AuthenticatedGuard)
  @Redirect()
  postEditSliderById(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.appService.postEditSliderById(id, req);
  }

  // Xóa slider
  @Get('sliders/delete/:id')
  @UseGuards(AuthenticatedGuard)
  @Redirect()
  getDeleteSliderById(@Param('id') id: string) {
    return this.appService.getDeleteSliderById(id);
  }

  // SLIDER END----------------------------------------------------------------------------------------
}
