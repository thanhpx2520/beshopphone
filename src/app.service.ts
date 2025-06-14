import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './modules/collections/products/schemas/product.schema';
import { Model, Types } from 'mongoose';
import { Comment } from './modules/collections/comments/schemas/comment.schema';
import { Order } from './modules/collections/orders/schemas/order.schema';
import { Auth } from './auths/schemas/auth.schema';
import { Category } from './modules/collections/categories/schemas/category.schema';
import { pipeline } from 'stream';
import * as fs from 'fs';
import path, { join } from 'path';
import { createFolderAndSaveFile, deleteImageFile } from './helpers/utils';
import { name } from 'ejs';
import { Banner } from './modules/collections/banners/schemas/banner.schema';
import { Slider } from './modules/collections/sliders/schemas/slider.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Banner.name) private bannerModel: Model<Banner>,
    @InjectModel(Auth.name) private authModel: Model<Auth>,
    @InjectModel(Slider.name) private sliderModel: Model<Slider>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async login(data: any) {
    const { email, password } = data;
    const admin = await this.authModel.findOne({ email });

    if (!admin) {
      return { success: false, message: 'Email không tồn tại' };
    }

    if (admin.password === password && admin.role === 'admin') {
      return { success: true, message: 'Đăng nhập thành công' };
    }

    return { success: false, message: 'Sai mật khẩu' };
  }

  async getDashBoardData() {
    const productsCount = await this.productModel.countDocuments();
    const commentsCount = await this.commentModel.countDocuments();
    const ordersCount = await this.orderModel.countDocuments();
    const usersCount = await this.authModel.countDocuments();
    return { productsCount, commentsCount, ordersCount, usersCount };
  }

  async getCategories(query: any) {
    const limit = parseInt(query.limit) || 10;
    const page = parseInt(query.page) || 1;
    const total = await this.categoryModel.countDocuments();

    const categories = await this.categoryModel
      .find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    const newCategories = categories.map((category) => {
      // Tạo một đối tượng mới không có prototype
      return Object.create(null, {
        _id: { value: category._id.toString() },
        title: { value: category.title },
        // Thêm các trường khác nếu cần
      });
    });

    return {
      newCategories,
      pages: {
        total,
        limit,
        totalPages,
        currentPage: page,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        next: page < totalPages ? page + 1 : null,
        prev: page > 1 ? page - 1 : null,
      },
    };
  }

  async getCategoryById(id: string) {
    const category = await this.categoryModel.findById(id);

    return {
      title: category?.title,
      id: category?._id,
      data: {},
    };
  }

  async getUserById(id: string) {
    const user = await this.authModel.findById(id);

    return {
      full_name: user?.full_name || '',
      email: user?.email || '',
      role: user?.role || '',
      data: {},
    };
  }

  async getProductById(id: string) {
    const product = await this.productModel.findById(id);

    const categories = await this.categoryModel.find().select('title');

    return {
      product: {
        prd_name: product?.name,
        prd_price: product?.price,
        prd_warranty: product?.warranty,
        prd_accessories: product?.accessories,
        prd_promotion: product?.promotion,
        prd_new: product?.status,
        prd_image: product?.thumbnail,
        cat_id: product?.cat_id,
        prd_status: product?.is_stock,
        prd_featured: product?.featured,
        prd_details: product?.description,
      },
      categories,
      data: {},
    };
  }

  async editCategoryById(id: string, body: any, res: any) {
    const existing = await this.categoryModel.findOne({
      title: body.title,
    });

    if (existing) {
      return res.view('/category/edit-category', {
        data: { err: 'Danh mục đã tồn tại !' },
        title: body.title,
        id: body.id,
      });
    }

    await this.categoryModel.findByIdAndUpdate(id, { title: body.title });

    return {
      url: `/admin/categories`,
    };
  }

  async editUserById(id: string, body: any, res: any) {
    const userId = await this.authModel.findById({ _id: id });
    const existing = await this.authModel.findOne({ email: body.email });

    if (existing?.email && existing?.email !== userId?.email) {
      return res.view('/user/edit-user', {
        data: { err: 'Email đã tồn tại !' },
        full_name: userId?.full_name,
        email: userId?.email,
        role: userId?.role,
      });
    }

    const { re_password, ...data } = body;
    const updated = await this.authModel.findByIdAndUpdate({ _id: id }, data);

    if (updated) {
      return {
        url: '/admin/users',
      };
    }

    await this.categoryModel.findByIdAndUpdate(id, { title: body.title });

    return {
      url: `/admin/categories`,
    };
  }

  async editProductById(id: string, body: any, req: any) {
    const product = await this.productModel.findOne({
      _id: id,
    });

    const file = await req.file();
    let data = {};

    if (file.filename === '') {
      data = {
        description: file.fields.prd_details.value,
        price: file.fields.prd_price.value,
        cat_id: file.fields.cat_id.value,
        status: file.fields.prd_new.value,
        featured: file.fields.prd_featured?.value || 0,
        promotion: file.fields.prd_promotion.value,
        warranty: file.fields.prd_warranty.value,
        accessories: file.fields.prd_accessories.value,
        is_stock: file.fields.prd_status.value,
        name: file.fields.prd_name.value,
        slug: file.fields.prd_name.value,
      };
    } else {
      const fileSaved = await createFolderAndSaveFile('products', file);

      const shortName = product?.thumbnail?.substring(9) || '';
      await deleteImageFile('products', shortName);

      data = {
        thumbnail: `products/${fileSaved.filename}`,
        description: fileSaved.fields.prd_details.value,
        price: fileSaved.fields.prd_price.value,
        cat_id: fileSaved.fields.cat_id.value,
        status: fileSaved.fields.prd_new.value,
        featured: fileSaved.fields.prd_featured?.value || 0,
        promotion: fileSaved.fields.prd_promotion.value,
        warranty: fileSaved.fields.prd_warranty.value,
        accessories: fileSaved.fields.prd_accessories.value,
        is_stock: fileSaved.fields.prd_status.value,
        name: fileSaved.fields.prd_name.value,
        slug: fileSaved.fields.prd_name.value,
      };
    }

    await this.productModel.findByIdAndUpdate({ _id: id }, data);

    return {
      url: `/admin/products`,
    };
  }

  async addCategoryById(body: any, res: any) {
    const existing = await this.categoryModel.findOne({
      title: body.title,
    });

    if (existing) {
      return res.view('/category/add-category', {
        data: { err: 'Danh mục đã tồn tại !' },
        title: body.title,
        id: body.id,
      });
    }

    const data = { description: null, title: body.title, slug: body.title };
    await this.categoryModel.create(data);

    return {
      url: `/admin/categories`,
    };
  }

  async deleteCategoryById(id: string, body: any) {
    const deleted = await this.categoryModel.findOneAndDelete({ _id: id });

    if (!deleted) {
      return {
        url: `/admin/categories`,
      };
    }

    return {
      url: `/admin/categories`,
    };
  }

  async deleteProductById(id: string, body: any) {
    const deleted = await this.productModel.findOne({ _id: id });

    const shortName = deleted?.thumbnail?.substring(9) || '';

    await this.productModel.findOneAndDelete({ _id: id });
    await deleteImageFile('products', shortName);

    if (!deleted) {
      return {
        url: `/admin/products`,
      };
    }

    return {
      url: `/admin/products`,
    };
  }

  async getProducts(query: any) {
    const search = query.search?.trim() || '';
    const limit = parseInt(query.limit) || 10;
    const page = parseInt(query.page) || 1;

    const filter: any = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const total = await this.productModel.countDocuments(filter);

    const products = await this.productModel
      .find(filter)
      .populate('cat_id', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    const newProducts = products.map((product) => {
      return {
        id: product._id,
        name: product.name,
        image: product.thumbnail,
        price: product.price,
        is_stock: product.is_stock,
        category: product.cat_id,
      };
    });

    return {
      newProducts,
      pages: {
        total,
        limit,
        totalPages,
        currentPage: page,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        next: page < totalPages ? page + 1 : null,
        prev: page > 1 ? page - 1 : null,
      },
    };
  }

  async getCategoryForProduct() {
    const categories = await this.categoryModel.find().select('title');
    return { categories };
  }

  async addProduct(req: any) {
    const file = await req.file();

    const fileSaved = await createFolderAndSaveFile('products', file);
    const data = {
      thumbnail: `products/${fileSaved.filename}`,
      description: fileSaved.fields.prd_details.value,
      price: fileSaved.fields.prd_price.value,
      cat_id: fileSaved.fields.cat_id.value,
      status: fileSaved.fields.prd_status.value,
      featured: fileSaved.fields.prd_featured.value,
      promotion: fileSaved.fields.prd_promotion.value,
      warranty: fileSaved.fields.prd_warranty.value,
      accessories: fileSaved.fields.prd_accessories.value,
      is_stock: true,
      name: fileSaved.fields.prd_name.value,
      slug: fileSaved.fields.prd_name.value,
    };

    await this.productModel.create({
      ...data,
      cat_id: new Types.ObjectId(data.cat_id),
    });
  }

  async getUsers(query: any) {
    const limit = parseInt(query.limit) || 10;
    const page = parseInt(query.page) || 1;
    const total = await this.authModel.countDocuments();

    const users = await this.authModel
      .find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    return {
      users,
      pages: {
        total,
        limit,
        totalPages,
        currentPage: page,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        next: page < totalPages ? page + 1 : null,
        prev: page > 1 ? page - 1 : null,
      },
    };
  }

  async addUser(body: any, res: any) {
    const existing = await this.authModel.findOne({
      email: body.email,
    });

    if (existing) {
      return res.view('/user/add-user', {
        data: { err: 'Email đã tồn tại !' },
      });
    }

    if (body.password !== body.re_password) {
      return res.view('/user/add-user', {
        data: { err: 'Mật khẩu không trùng khớp !' },
      });
    }

    const data = {
      full_name: body.full_name,
      email: body.email,
      password: body.password,
      phone_number: null,
      address: null,
      role: body.role,
    };
    await this.authModel.create(data);

    return {
      url: `/admin/users`,
    };
  }

  async deleteUserById(id: string, body: any) {
    const deleted = await this.authModel.findOneAndDelete({ _id: id });

    if (!deleted) {
      return {
        url: `/admin/users`,
      };
    }

    return {
      url: `/admin/users`,
    };
  }

  // BANNER START---------------------------------------------------------------------------------------------------------------------------

  // Hàm lấy tất cả (banner) quảng cáo cho web khác
  async getAllBanners(query: any) {
    const limit = parseInt(query.limit) || 10;
    const page = parseInt(query.page) || 1;

    const total = await this.bannerModel.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const banners = await this.bannerModel
      .find()
      .sort({ position: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      banners,
      pages: {
        total,
        limit,
        totalPages,
        currentPage: page,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        next: page < totalPages ? page + 1 : null,
        prev: page > 1 ? page - 1 : null,
      },
    };
  }

  // Hàm lưu thêm mới banner
  async postAddBanner(req: any) {
    const file = await req.file();
    const fileSaved = await createFolderAndSaveFile('', file);

    const maxBanner = await this.bannerModel
      .findOne()
      .sort({ position: -1 })
      .exec();

    const nextPosition = maxBanner ? maxBanner.position + 1 : 1;

    const data = {
      image: fileSaved?.filename,
      url: fileSaved.fields.url.value,
      public: fileSaved.fields.public.value,
      position: nextPosition,
    };

    const createdBanner = await this.bannerModel.create(data);

    if (createdBanner) {
      return { url: '/admin/banners' };
    } else {
      return { url: '/admin/banners/add' };
    }
  }

  // Hàm lấy banner bằng id
  async getBannerById(id: string) {
    const banner = await this.bannerModel.findById(id);

    return {
      banner,
    };
  }

  // Hàm sửa banner bằng id
  async postEditBannerById(id: string, req: any) {
    let data = {};
    const file = await req.file();
    const banner = await this.bannerModel.findOne({
      _id: id,
    });
    if (file.filename === '') {
      data = {
        url: file.fields.url.value,
        public: file.fields.public.value,
      };
    } else {
      const fileSaved = await createFolderAndSaveFile('', file);
      const fileName = banner?.image || '';
      await deleteImageFile('', fileName);
      data = {
        image: fileSaved.filename,
        url: fileSaved.fields.url.value,
        public: fileSaved.fields.public.value,
      };
    }
    await this.bannerModel.findByIdAndUpdate({ _id: id }, data);
    return {
      url: `/admin/banners`,
    };
  }

  // Hàm xóa banner bằng id
  async getDeleteBannerById(id: string) {
    const banner = await this.bannerModel.findOne({ _id: id });
    const nameImage = banner?.image || '';

    const deleted = await this.bannerModel.findOneAndDelete({ _id: id });
    await deleteImageFile('', nameImage);

    if (deleted) {
      return {
        url: `/admin/banners`,
      };
    }

    return {
      url: `/admin/banners`,
    };
  }

  // BANNER END---------------------------------------------------------------------------------------------------------------------------
  // COMMENT START--------------------------------------------------------------------------------------------------------------------------

  // Hàm lấy tất cả (comment) bình luận
  async getAllComments(query: any) {
    const limit = parseInt(query.limit) || 10;
    const page = parseInt(query.page) || 1;

    const total = await this.commentModel.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const comments = await this.commentModel
      .find()
      .sort({ createdAt: -1 })
      .populate('prd_id')
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      comments,
      pages: {
        total,
        limit,
        totalPages,
        currentPage: page,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        next: page < totalPages ? page + 1 : null,
        prev: page > 1 ? page - 1 : null,
      },
    };
  }

  // Hàm lấy comment bằng id
  async getCommentById(id: string) {
    const comment = await this.commentModel.findById(id).populate('prd_id');

    return {
      comment,
    };
  }

  // Hàm sửa comment bằng id
  async postEditCommentById(id: string, body: any) {
    await this.commentModel.findByIdAndUpdate({ _id: id }, body);
    return {
      url: `/admin/comments`,
    };
  }

  // Hàm xóa comment bằng id
  async getDeleteCommentById(id: string) {
    const deleted = await this.commentModel.findOneAndDelete({ _id: id });
    if (deleted) {
      return {
        url: `/admin/comments`,
      };
    }

    return {
      url: `/admin/comments`,
    };
  }

  // COMMENT END--------------------------------------------------------------------------------------------------------------------------
  // ORDER START----------------------------------------------------------------------------------------------------------------------------

  // Hàm lấy tất cả (order) đơn hàng
  async getAllOrders(query: any) {
    const limit = parseInt(query.limit) || 10;
    const page = parseInt(query.page) || 1;

    const total = await this.orderModel.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const orders = await this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      orders,
      pages: {
        total,
        limit,
        totalPages,
        currentPage: page,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        next: page < totalPages ? page + 1 : null,
        prev: page > 1 ? page - 1 : null,
      },
    };
  }

  // Hàm lấy order bằng id
  async getOrderById(id: string) {
    const order = await this.orderModel.findById(id).populate('items.prd_id');

    return {
      order,
    };
  }

  // Hàm sửa order bằng id
  async postEditOrderById(id: string, body: any) {
    await this.orderModel.findByIdAndUpdate({ _id: id }, body);
    return {
      url: `/admin/orders`,
    };
  }

  // Hàm xóa order bằng id
  async getDeleteOrderById(id: string) {
    const deleted = await this.orderModel.findOneAndDelete({ _id: id });
    if (deleted) {
      return {
        url: `/admin/orders`,
      };
    }

    return {
      url: `/admin/orders`,
    };
  }

  // ORDER END----------------------------------------------------------------------------------------------------------------------------
  // SLIDER START---------------------------------------------------------------------------------------------------------------------------

  // Hàm lấy tất cả (slider) quảng cáo của shop
  async getAllSliders(query: any) {
    const limit = parseInt(query.limit) || 10;
    const page = parseInt(query.page) || 1;

    const total = await this.sliderModel.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const sliders = await this.sliderModel
      .find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      sliders,
      pages: {
        total,
        limit,
        totalPages,
        currentPage: page,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        next: page < totalPages ? page + 1 : null,
        prev: page > 1 ? page - 1 : null,
      },
    };
  }

  // Hàm lưu thêm mới slider
  async postAddSlider(req: any) {
    const file = await req.file();
    const fileSaved = await createFolderAndSaveFile('', file);

    const maxSlider = await this.sliderModel
      .findOne()
      .sort({ position: -1 })
      .exec();

    const nextPosition = maxSlider ? maxSlider.position + 1 : 1;

    const data = {
      image: fileSaved?.filename,
      public: fileSaved.fields.public.value,
      position: nextPosition,
    };

    const createdSlider = await this.sliderModel.create(data);

    if (createdSlider) {
      return { url: '/admin/sliders' };
    } else {
      return { url: '/admin/sliders/add' };
    }
  }

  // Hàm lấy slider bằng id
  async getSliderById(id: string) {
    const slider = await this.sliderModel.findById(id);

    return {
      slider,
    };
  }

  // Hàm sửa slider bằng id
  async postEditSliderById(id: string, req: any) {
    let data = {};
    const file = await req.file();
    const slider = await this.sliderModel.findOne({
      _id: id,
    });
    if (file.filename === '') {
      data = {
        public: file.fields.public.value,
      };
    } else {
      const fileSaved = await createFolderAndSaveFile('', file);
      const fileName = slider?.image || '';
      await deleteImageFile('', fileName);
      data = {
        image: fileSaved.filename,
        public: fileSaved.fields.public.value,
      };
    }
    await this.sliderModel.findByIdAndUpdate({ _id: id }, data);
    return {
      url: `/admin/sliders`,
    };
  }

  // Hàm xóa slider bằng id
  async getDeleteSliderById(id: string) {
    const slider = await this.sliderModel.findOne({ _id: id });
    const nameImage = slider?.image || '';

    const deleted = await this.sliderModel.findOneAndDelete({ _id: id });
    await deleteImageFile('', nameImage);

    if (deleted) {
      return {
        url: `/admin/sliders`,
      };
    }

    return {
      url: `/admin/sliders`,
    };
  }

  // SLIDER END---------------------------------------------------------------------------------------------------------------------------
}
